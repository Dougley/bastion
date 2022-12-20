import { Hono } from "hono";
import { logger } from "hono/logger";
import { sentry } from "@honojs/sentry";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Database } from "database";
import { verifyPayload } from "./middleware/crypto-verify";
import { importKey } from "./crypto/import";
import { sign } from "./crypto/sign";
import { APIUser } from "discord-api-types/v9";
import { discordExchange } from "./middleware/discord-exchange";

const router = new Hono<{ Bindings: Env }>();

router.use("*", logger());
router.use("*", (c, next) => {
  return sentry({
    dsn: c.env.SENTRY_DSN,
  })(c, next);
});

router.get("/", async (ctx) => {
  const url = new URL("https://discord.com/oauth2/authorize");
  let storedKey = await ctx.env.KV.get("key");
  if (!storedKey) {
    const key = (await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    )) as CryptoKey;
    const keyJson = await crypto.subtle.exportKey("jwk", key);
    await ctx.env.KV.put("key", JSON.stringify(keyJson));
    storedKey = JSON.stringify(keyJson);
  }
  const key = await importKey(storedKey);
  const sig = await sign(
    JSON.stringify({
      ts: Date.now(),
    }),
    key
  );
  const state = btoa(
    JSON.stringify({
      ts: Date.now(),
      sig: sig,
    })
  );
  ctx.cookie("state", state, {
    httpOnly: true,
    secure: !ctx.env.DEV,
    signed: true,
    maxAge: 1000 * 60 * 5, // 5 minutes
  });
  url.searchParams.set("client_id", ctx.env.DISCORD_CLIENT_ID);
  url.searchParams.set("scope", "identify guilds.join role_connections.write");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  const currentBase = ctx.env.DEV
    ? "http://localhost:8787"
    : new URL(ctx.req.url).origin;
  url.searchParams.set("redirect_uri", currentBase + "/discord/callback");
  return ctx.redirect(url.toString());
});

router.get(
  "/discord/callback",
  verifyPayload(),
  discordExchange(),
  async (ctx) => {
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: ctx.env.DB }),
    });
    const access_token = ctx.get("access_token") as string;
    const user = ctx.get("user") as APIUser;
    const member = await db
      .selectFrom("members")
      .select(["whitelisted", "blacklisted", "whitelisted_by"])
      .where("id", "=", user.id)
      .executeTakeFirst();
    if (!member || !member.whitelisted || member.blacklisted) {
      return ctx.text("You are not whitelisted", 403);
    }
    const joined_at = new Date().toISOString();
    const roleLink = await fetch(
      `https://discord.com/api/v10/users/@me/applications/${ctx.env.DISCORD_CLIENT_ID}/role-connection`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform_name: "Bastion Invites",
          platform_username: user.username,
          metadata: {
            joined_at,
          },
        }),
      }
    );
    if (!roleLink.ok) {
      return ctx.text("Failed to link role", 500);
    }
    const guildJoin = await fetch(
      `https://discord.com/api/guilds/${ctx.env.DISCORD_SERVER_ID}/members/${user.id}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bot ${ctx.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: access_token,
        }),
      }
    );
    if (!guildJoin.ok) {
      return ctx.text("Failed to join guild", 500);
    }
    await db
      .updateTable("members")
      .set({
        joined_at,
      })
      .where("id", "=", user.id)
      .where("joined_at", "=", undefined)
      .execute();
    return ctx.text("Done!");
  }
);

export default router;
