import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { createElement, Message, UserCommandHandler } from "slshx";

export function getInvitedBy(): UserCommandHandler<Env> {
  return async (interaction, env, ctx) => {
    try {
      const db = new Kysely<Database>({
        dialect: new D1Dialect({ database: env.DB }),
      });
      const user = await db
        .selectFrom("members")
        .where("members.id", "=", interaction.data.target_id)
        .innerJoin("invites as i", "i.id", "members.invited_with")
        .innerJoin("members as m", "m.id", "i.owner_id")
        .select(["i.code", "m.id"])
        .executeTakeFirst();
      console.log(user);
      if (!user || !user.code) {
        return <Message>This user was not invited by anyone.</Message>;
      }
      return (
        <Message ephemeral>
          {`<@${interaction.data.target_id}> was invited by <@${user.id}> with invite code \`${user.code}\``}
        </Message>
      );
    } catch (e) {
      console.log(e);
    }
  };
}
