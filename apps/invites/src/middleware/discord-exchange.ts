import { APIUser } from "discord-api-types/v9";
import { MiddlewareHandler } from "hono";

export function discordExchange(): MiddlewareHandler<
  string,
  { Bindings: Env }
> {
  return async (ctx, next) => {
    try {
      const code = ctx.req.query("code");
      const currentBase = ctx.env.DEV
        ? "http://localhost:8787"
        : new URL(ctx.req.url).origin;
      const res = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: "1047607535269597254",
          client_secret: "NsBh4PPJmpfuZplU2JtnUlrLiDGxqb16",
          grant_type: "authorization_code",
          code,
          redirect_uri: `${currentBase}/discord/callback`,
        }),
      });
      if (!res.ok) {
        return ctx.text("Failed to get access token", 500);
      }
      const json = (await res.json()) as {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
      };
      ctx.set("access_token", json.access_token);
      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${json.token_type} ${json.access_token}`,
        },
      });
      if (!userRes.ok) {
        return ctx.text("Failed to get user info", 500);
      }
      const userJson = (await userRes.json()) as APIUser;
      ctx.set("user", userJson);
      return next();
    } catch (e) {
      console.log(e);
      return ctx.text("Failed to exchange code", 500);
    }
  };
}
