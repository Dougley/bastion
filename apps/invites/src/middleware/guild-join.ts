import { APIUser } from "discord-api-types/v9";
import { MiddlewareHandler } from "hono";

export function joinGuild(): MiddlewareHandler<string, { Bindings: Env }> {
  return async (ctx, next) => {
    const user = ctx.get("user") as APIUser;
    const accessToken = ctx.get("access_token");
    const res = await fetch(
      `https://discord.com/api/guilds/${ctx.env.DISCORD_SERVER_ID}/members/${user.id}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bot ${ctx.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );
    if (!res.ok) {
      return ctx.text("Failed to add user to guild", 500);
    }
    return next();
  };
}
