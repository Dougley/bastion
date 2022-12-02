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

const router = new Hono<{ Bindings: Env }, "/wot">();

router.use("*", logger());
router.use("*", (c, next) => {
  return sentry({
    dsn: c.env.SENTRY_DSN,
  })(c, next);
});

router.get("/", async (ctx) => {
  return ctx.redirect("https://github.com/Dougley/bastion");
});

router.get("/wot/:invite", async (ctx) => {
  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: ctx.env.DB }),
  });
  const invite = await db
    .selectFrom("invites")
    .selectAll()
    .where("code", "=", ctx.req.param("invite"))
    .executeTakeFirst();
  if (!invite || !invite.usable) {
    return ctx.text("Invalid invite code", 404);
  }
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
      invite: ctx.req.param("invite"),
    }),
    key
  );
  url.searchParams.set("client_id", "1047607535269597254");
  url.searchParams.set("scope", "identify guilds.join");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set(
    "state",
    btoa(
      JSON.stringify({
        ts: Date.now(),
        invite: invite.code,
        sig: sig,
      })
    )
  );
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
    const access_token = ctx.get("access_token");
    const user = ctx.get("user") as APIUser;
    const state = JSON.parse(atob(ctx.req.query("state")));
    const invite = await db
      .selectFrom("invites")
      .selectAll()
      .where("code", "=", state.invite)
      .executeTakeFirst();
    if (!invite) {
      return ctx.text("Invalid invite code", 404);
    }
    const guildJoin = await fetch(
      `https://discord.com/api/guilds/1034462346908794910/members/${user.id}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bot MTA0NzYwNzUzNTI2OTU5NzI1NA.GoYTiw.VZ4UT2NmiusZq4droKTe1OHOVZIAM0i9NFJ_js`,
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
    if (invite.uses + 1 >= invite.max_uses) {
      await db
        .updateTable("invites")
        .set({ usable: false })
        .where("code", "=", invite.code)
        .execute();
    }
    await db
      .updateTable("invites")
      .set({
        updated_at: new Date().toISOString(),
        uses: invite.uses + 1,
      })
      .where("code", "=", state.invite)
      .execute();
    await db.deleteFrom("members").where("id", "=", user.id).execute();
    await db
      .insertInto("members")
      .values({
        id: user.id,
        invited_with: state.invite,
      })
      .execute();
    return ctx.text("Joined guild");
  }
);

export default router;
