import { Database } from "database";
import { APIUser } from "discord-api-types/v9";
import { MiddlewareHandler } from "hono";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

export function setMetadata(): MiddlewareHandler<string, { Bindings: Env }> {
  return async (ctx, next) => {
    const user = ctx.get("user") as APIUser;
    const accessToken = ctx.get("access_token");
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: ctx.env.DB }),
    });
    const joined_at = new Date().toISOString();
    const metadataSet = await ctx.env.KV.get("metadata-set-v1");
    if (!metadataSet) {
      const metadata = await fetch(
        `https://discord.com/api/v10/applications/${ctx.env.DISCORD_CLIENT_ID}/role-connections/metadata`,
        {
          method: "PUT",
          headers: {
            authorization: `Bot ${ctx.env.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              type: 5,
              name: "Joined At",
              description: "The date the user joined the server",
              key: "joined_at",
            },
          ]),
        }
      );
      if (!metadata.ok) {
        return ctx.text("Failed to set metadata", 500);
      }
      await ctx.env.KV.put("metadata-set-v1", "true");
    }
    const currentJoinedAt = await db
      .selectFrom("members")
      .select("joined_at")
      .where("id", "=", user.id)
      .executeTakeFirst();      
    const roleLink = await fetch(
      `https://discord.com/api/v10/users/@me/applications/${ctx.env.DISCORD_CLIENT_ID}/role-connection`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform_name: "Bastion Invites",
          platform_username: user.username,
          metadata: {
            joined_at: currentJoinedAt?.joined_at ?? joined_at,
          },
        }),
      }
    );
    if (!roleLink.ok) {
      return ctx.text("Failed to link role", 500);
    }
    return next();
  };
}
