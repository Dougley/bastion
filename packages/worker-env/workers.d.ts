interface Env {
  // Add KV namespaces, Durable Object bindings, secrets, etc. here
  // KV_NAMESPACE: KVNamespace;
  // DURABLE_OBJECT: DurableObjectNamespace;
  // SECRET: string;
  DB: D1Database;
  KV: KVNamespace;
  SENTRY_DSN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_SERVER_ID: string;
  DEV?: boolean;
  INVITE_SITE: string;
}
