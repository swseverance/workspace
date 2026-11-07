import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

// One Upstash database is shared across Firebase projects and environments
// (local runs against the dev project), so every key is namespaced by both.
export const redisKey = (name: string) =>
  `${process.env['FIREBASE_PROJECT_ID']}:${process.env['ENVIRONMENT_NAME']}:${name}`;
