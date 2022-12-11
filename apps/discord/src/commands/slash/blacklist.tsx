import { Database } from "database";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
  useString,
  useButton,
  Row,
  Button,
  Embed,
  Field,
  useDefaultPermission,
} from "slshx";

export function blacklist(): CommandHandler<Env> {
  useDescription("Blacklist someone.");
  useDefaultPermission(false);
  const user = useString("id", "The ID of the user to blacklist.", {
    required: true,
  });
  const confirm = useButton(async (interaction, env: Env, ctx) => {
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });
    await db
      .insertInto("members")
      .values({
        id: user,
        blacklisted: true,
        whitelisted: false,
        blacklisted_by: interaction.member!.user.id,
      })
      .execute();
    return <Message update>Done! {user} is now blacklisted.</Message>;
  });
  const cancel = useButton(async (interaction, env: Env, ctx) => {
    return <Message update>Cancelled.</Message>;
  });
  return async (interaction, env, ctx) => {
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });
    const info = await db
      .selectFrom("members")
      .select([
        "blacklisted",
        "whitelisted",
        "blacklisted_by",
        "whitelisted_by",
      ])
      .where("id", "=", user)
      .executeTakeFirst();
    return (
      <Message>
        You sure you want to blacklist {user}? This will prevent them from
        joining the server, though it won't remove them if they're already in.
        <Embed title="User info">
          <Field name="Whitelisted" inline>
            {info?.whitelisted ? "Yes" : "No"}
          </Field>
          <Field name="Whitelisted by" inline>{`<@${
            info?.whitelisted_by ?? "unknown"
          }>`}</Field>
        </Embed>
        <Row>
          <Button id={confirm} emoji="✔️" success>
            Yes, I'm sure
          </Button>
          <Button id={cancel} emoji="✖️" danger>
            No, cancel
          </Button>
        </Row>
      </Message>
    );
  };
}
