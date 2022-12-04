import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { CommandHandler, useDescription, createElement, Message } from "slshx";

export function createinvite(): CommandHandler<Env> {
  useDescription("Create an invite link for the server.");
  return async (interaction, env, ctx) => {
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });

    // a member can only create invite links after being in the server for a month
    // if (new Date(interaction.member!.joined_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
    //   return (
    //     <Message>
    //       You need to be in the server for at least a month to create an invite link.
    //     </Message>
    //   )
    // }

    // generate a random string of 6 alphanumeric characters
    const code = Math.random().toString(36).slice(-6);
    // seed users if they don't exist
    if (
      !(await db
        .selectFrom("members")
        .where("id", "=", interaction.member!.user.id)
        .selectAll()
        .executeTakeFirst())
    ) {
      await db
        .insertInto("members")
        .values({
          id: interaction.member!.user.id,
          joined_at: new Date(interaction.member!.joined_at).toISOString(),
          invited_with: null,
        })
        .execute();
    }
    await db
      .insertInto("invites")
      .values({
        code,
        owner_id: interaction.member!.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();
    return (
      <Message ephemeral>
        Your invite is **{`${env.INVITE_SITE}/${code}`}**{"\n\n"}This invite is
        single use, and is valid indefinitly. Please remember you bear
        responsibility for who you invite.
      </Message>
    );
  };
}
