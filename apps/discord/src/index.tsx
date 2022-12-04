import { createHandler } from "slshx";
import * as SlashCommands from "./commands/slash";
import * as UserContextCommands from "./commands/user";
import Toucan from "toucan-js";

const handler = createHandler({
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  applicationId: SLSHX_APPLICATION_ID,
  applicationPublicKey: SLSHX_APPLICATION_PUBLIC_KEY,
  applicationSecret: SLSHX_APPLICATION_SECRET,
  testServerId: SLSHX_TEST_SERVER_ID,
  commands: { ...SlashCommands },
  userCommands: {
    "Invited By": UserContextCommands.getInvitedBy,
  },
});

export default {
  fetch: (request: Request, env: Env, context: ExecutionContext) => {
    const toucan = new Toucan({
      dsn: env.SENTRY_DSN,
      context,
      request,
    });
    try {
      return handler(request, env, context);
    } catch (e) {
      toucan.captureException(e);
      console.log(e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
