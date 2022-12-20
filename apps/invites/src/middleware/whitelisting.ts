import { Database } from "database";
import { APIUser } from "discord-api-types/v9";
import { MiddlewareHandler } from "hono";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

export function checkWhitelist(): MiddlewareHandler<string, { Bindings: Env }> {
  return async (ctx, next) => {
    const user = ctx.get("user") as APIUser;
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: ctx.env.DB }),
    });
    const member = await db
      .selectFrom("members")
      .select(["whitelisted", "blacklisted"])
      .where("id", "=", user.id)
      .executeTakeFirst();
    if (!member || !member.whitelisted || member.blacklisted) {
      return ctx.text("You are not whitelisted", 403);
    }
    ctx.set("member", member);
    return next();
  };
}
