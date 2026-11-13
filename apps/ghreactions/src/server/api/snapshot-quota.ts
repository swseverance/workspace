import { redisKey, redisProvider } from '@org/redis';
import { serializeError } from '@org/server';
import * as logger from 'firebase-functions/logger';

/**
 * How many snapshots for new users the site builds in a day (UTC).
 *
 * Every one is another document for refreshProfile, which refreshes 1,440 a
 * day, and they last REQUESTED_SNAPSHOT_DAYS. So at most 30 times this many
 * exist at once (3,000), which keeps a full refresh cycle to a few days.
 */
export const MAX_NEW_SNAPSHOTS_PER_DAY = 100;

// An object, so specs can replace it.
export const snapshotQuota = {
  /**
   * Counts one new snapshot against today's quota; false once it's used up.
   * Fails open, like the rate limits: without Redis there's no count, and
   * App Check and the per-visitor rate limit still stand.
   */
  async take(): Promise<boolean> {
    try {
      const redis = redisProvider.get();
      const key = redisKey(
        `snapshots:${new Date().toISOString().slice(0, 10)}`,
      );
      const count = await redis.incr(key);
      // Two days, so the key outlives its day whatever the clock skew.
      if (count === 1) await redis.expire(key, 2 * 24 * 60 * 60);
      return count <= MAX_NEW_SNAPSHOTS_PER_DAY;
    } catch (err) {
      logger.error('[snapshot quota] Redis unavailable:', serializeError(err));
      return true;
    }
  },
};
