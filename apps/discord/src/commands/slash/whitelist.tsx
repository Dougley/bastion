import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
  useString,
} from "slshx";

export function whitelist(): CommandHandler<Env> {
  useDescription("Whitelist someone.");
  const user = useString("id", "The ID of the user to whitelist.", {
    required: true,
  });
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

    // check if the user is already whitelisted
    const whitelisted = await db
      .selectFrom("members")
      .select("id")
      .where("id", "=", user)
      .executeTakeFirst();
    if (whitelisted) {
      return <Message>{user} is already whitelisted.</Message>;
    }
    // check if the user has no invites remaining
    const invites = await db
      .selectFrom("members")
      .select("invites")
      .where("id", "=", interaction.member!.user.id)
      .executeTakeFirst();
    if (invites?.invites === 0) {
      return <Message>You have no invites remaining.</Message>;
    }
    await db
      .updateTable("members")
      .set({ invites: invites?.invites ?? 1 - 1 })
      .where("id", "=", interaction.member!.user.id)
      .execute();
    await db
      .insertInto("members")
      .values({
        id: user,
        whitelisted: true,
        whitelisted_by: interaction.member!.user.id,
      })
      .execute();
    return (
      <Message ephemeral>
        Done! {user} is now whitelisted.{"\n"}
        Tell them to go to {env.INVITE_SITE} to join the server.
      </Message>
    );
  };
}
