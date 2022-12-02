import { MiddlewareHandler } from "hono";
import { importKey } from "../crypto/import";
import { verify } from "../crypto/verify";

export function verifyPayload(): MiddlewareHandler<string, { Bindings: Env }> {
  return async (ctx, next) => {
    try {
      const state = JSON.parse(atob(ctx.req.query("state")));
      if (!state) {
        return ctx.text("Invalid state", 400);
      }
      const timestamp = new Date(state.ts);
      // 5 minute expiry
      if (Date.now() - timestamp.getTime() > 1000 * 60 * 5) {
        return ctx.text("State expired", 400);
      }
      const storedKey = await ctx.env.KV.get("key");
      if (!storedKey) {
        return ctx.text("Invalid state", 400);
      }
      const key = await importKey(storedKey);
      const verified = await verify(
        JSON.stringify({ ts: state.ts, invite: state.invite }),
        state.sig,
        key
      );
      if (!verified) {
        console.log("Invalid sig");
        return ctx.text("Invalid state", 400);
      }
      return next();
    } catch (e) {
      console.log(e);
      return ctx.text("Invalid state", 400);
    }
  };
}
