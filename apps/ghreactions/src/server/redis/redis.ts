import { Redis } from '@upstash/redis';

// Auto-pipelining wraps the client in a Proxy that routes commands past any
// stubbed method, which makes it untestable. We never issue more than a
// couple of commands at once, so batching them buys almost nothing.
export const redis = Redis.fromEnv({ enableAutoPipelining: false });

// One Upstash database is shared across Firebase projects and environments
// (local runs against the dev project), so every key is namespaced by both.
export const redisKey = (name: string) =>
  `${process.env['FIREBASE_PROJECT_ID']}:${process.env['ENVIRONMENT_NAME']}:${name}`;
