import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import {
  createElement,
  Embed,
  Field,
  Message,
  UserCommandHandler,
} from "slshx";

export function userInfo(): UserCommandHandler<Env> {
  return async (interaction, env, ctx) => {
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });
    const user = await db
      .selectFrom("members")
      .where("members.id", "=", interaction.data.target_id)
      .selectAll()
      .executeTakeFirst();
    if (!user) {
      return <Message ephemeral>I don't know anything about this user</Message>;
    }
    return (
      <Message>
        <Embed>
          <Field name="Blacklisted">{user.blacklisted ? "Yes" : "No"}</Field>
          <Field name="Whitelisted">{user.whitelisted ? "Yes" : "No"}</Field>
          <Field name="Blacklisted by">
            {user.blacklisted_by ? `<@${user.blacklisted_by}>` : "N/A"}
          </Field>
          <Field name="Whitelisted by">
            {user.whitelisted_by ? `<@${user.whitelisted_by}>` : "N/A"}
          </Field>
          <Field name="Invites left">
            {user.invites ? user.invites : "N/A"}
          </Field>
          <Field name="Joined">
            {user.joined_at
              ? `<t:${parseInt(
                  (new Date(user.joined_at).getTime() / 1000).toFixed(0)
                )}:R>`
              : "N/A"}
          </Field>
        </Embed>
      </Message>
    );
  };
}
