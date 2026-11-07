import * as logger from 'firebase-functions/logger';
import { AnalyticsResponse } from '../../models/analytics';
import { redis, redisKey } from '../redis/redis';
import { serializeError } from '../serialize-error';

const searchesKey = () => redisKey('analytics:searches');
// A HyperLogLog: counts distinct usernames (~1% error) in a fixed ~12 KB
// without storing the usernames themselves.
const profilesKey = () => redisKey('analytics:profiles');

/** Counts a new search. Never throws — analytics must not break a search. */
export async function recordSearch(username: string): Promise<void> {
  try {
    await Promise.all([
      redis.incr(searchesKey()),
      redis.pfadd(profilesKey(), username.toLowerCase()),
    ]);
  } catch (err) {
    logger.error('[analytics] record failed:', serializeError(err));
  }
}

export async function getStats(): Promise<AnalyticsResponse> {
  const [searches, profiles] = await Promise.all([
    redis.get<number>(searchesKey()),
    redis.pfcount(profilesKey()),
  ]);
  return { searches: searches ?? 0, profiles };
}

/**
 * Object wrapper so cross-module consumers can monkey-patch these in tests
 * (the Angular unit-test runner treats plain ESM named exports as read-only
 * bindings, so vi.mock/vi.spyOn can't intercept a relative import).
 */
export const analytics = { recordSearch, getStats };
