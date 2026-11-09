/**
 * Namespaces a Redis key by Firebase project and environment.
 *
 * One Upstash database is shared across Firebase projects and environments
 * (local runs against the dev project), so every key needs both. They're
 * read on each call, so tests can stub them.
 */
export const redisKey = (name: string) =>
  `${process.env['FIREBASE_PROJECT_ID']}:${process.env['ENVIRONMENT_NAME']}:${name}`;
