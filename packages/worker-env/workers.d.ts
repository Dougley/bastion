interface Env {
  // Add KV namespaces, Durable Object bindings, secrets, etc. here
  // KV_NAMESPACE: KVNamespace;
  // DURABLE_OBJECT: DurableObjectNamespace;
  // SECRET: string;
  DB: D1Database;
  KV: KVNamespace;
  SENTRY_DSN: string;
  DEV?: boolean;
}
