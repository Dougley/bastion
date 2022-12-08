import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { createElement, Message, UserCommandHandler } from "slshx";

export function getInvitedBy(): UserCommandHandler<Env> {
  return async (interaction, env, ctx) => {
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });
    const user = await db
      .selectFrom("members")
      .select("whitelisted_by")
      .where("members.id", "=", interaction.data.target_id)
      .executeTakeFirst();
    if (!user) {
      return <Message>This user was not invited by anyone.</Message>;
    }
    return (
      <Message ephemeral>
        {`<@${interaction.data.target_id}> was invited by <@${user.whitelisted_by}>`}
      </Message>
    );
  };
}
