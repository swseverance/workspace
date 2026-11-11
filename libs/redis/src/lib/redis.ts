import { createProvider } from '@org/server/core';
import { Redis } from '@upstash/redis';

/**
 * The shared Upstash client, read from the UPSTASH_REDIS_REST_* env vars.
 * Built on first use, so unit tests that provide a fake never construct a
 * real one.
 *
 * No retries: everything using Redis (rate limits, analytics) fails open, so
 * during an outage one quick failure beats ~4 s of default backoff on every
 * request. `retries: 0` is one attempt; note that `retry: false` would still
 * make two.
 */
export const redisProvider = createProvider(() =>
  Redis.fromEnv({ retry: { retries: 0 } }),
);
