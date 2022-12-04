import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
  useDefaultPermission,
  useNumber,
  useUser,
  useString,
} from "slshx";

export function createcustominvite(): CommandHandler<Env> {
  useDescription("Create a custom invite link for the server.");
  useDefaultPermission(false);
  const uses = useNumber(
    "uses",
    "The number of times the invite can be used.",
    { required: true, min: 1, max: 100 }
  );
  const blame = useUser("invited_with", "The user to bind this invite to.", {
    required: true,
  });
  const vanity = useString("code", "The code to use for the invite.");

  return async (interaction, env, ctx) => {
    try {
      const db = new Kysely<Database>({
        dialect: new D1Dialect({ database: env.DB }),
      });

      // generate a random string of 6 alphanumeric characters
      const code = Math.random().toString(36).slice(-6);
      // seed users if they don't exist
      if (
        !(await db
          .selectFrom("members")
          .where("id", "=", blame.id)
          .selectAll()
          .executeTakeFirst())
      ) {
        await db
          .insertInto("members")
          .values({
            id: blame.id,
            joined_at: new Date().toISOString(),
            invited_with: null,
          })
          .execute();
      }
      await db
        .insertInto("invites")
        .values({
          code: vanity ?? code,
          owner_id: blame.id,
          max_uses: uses,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
      return (
        <Message ephemeral>
          Your invite is **{`${env.INVITE_SITE}/${code}`}**{"\n\n"}This invite
          is valid indefinitly, with {uses} uses. Please remember you bear
          responsibility for who you invite.
        </Message>
      );
    } catch (e) {
      console.log(e);
      return <Message ephemeral>Something went wrong.</Message>;
    }
  };
}
