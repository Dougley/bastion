import { CommandHandler, useDescription, createElement, Message } from "slshx";

export function ping(): CommandHandler<Env> {
  useDescription("Pong!");
  return (interaction, env, ctx) => {
    return <Message>Pong!</Message>;
  };
}
