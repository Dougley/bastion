import { createHandler } from "slshx";
import * as SlashCommands from "./commands/slash";
import * as UserContextCommands from "./commands/user";

const handler = createHandler({
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  applicationId: SLSHX_APPLICATION_ID,
  applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
  applicationSecret: SLSHX_APPLICATION_SECRET,
  testServerId: SLSHX_TEST_SERVER_ID,
  commands: { ...SlashCommands },
  userCommands: {
    'Invited By': UserContextCommands.getInvitedBy,
  }
});

export default { fetch: handler };
