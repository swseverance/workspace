import { RateLimitError } from '../../../models/errors';
import { redis } from '../../redis/redis';

const THRESHOLD = 100;
const KEY = 'rate-limits:github';

type RateLimitHash = { remaining: number; reset: number };

export function isPrimaryLimitCloseToBeingBreached(res: Response): boolean {
  const remaining = res.headers.get('x-ratelimit-remaining');
  // A missing header (e.g. an auth failure response) is not the same as an
  // actual remaining count of zero — don't mistake one for the other.
  return remaining !== null && Number(remaining) < THRESHOLD;
}

export function isSecondaryLimitBreached(res: Response): boolean {
  const remaining = res.headers.get('x-ratelimit-remaining');
  return (
    res.status === 403 ||
    res.status === 429 ||
    res.headers.has('retry-after') ||
    (remaining !== null && Number(remaining) === 0)
  );
}

export async function checkRateLimit(): Promise<void> {
  try {
    const remaining = await redis.hget<number>(KEY, 'remaining');
    if (remaining === null) return;
    if (remaining < THRESHOLD) throw new RateLimitError();
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Redis unavailable — fail open
  }
}

export async function updateRateLimit(
  remaining: number,
  reset: number,
): Promise<void> {
  try {
    const current = await redis.hmget<RateLimitHash>(KEY, 'remaining', 'reset');
    if (current && current.reset === reset && current.remaining <= remaining)
      return;

    await redis.hset(KEY, { remaining, reset });
  } catch {
    // Redis unavailable — ignore
  }
}

/**
 * Object wrapper so cross-module consumers can monkey-patch these in tests
 * (the Angular unit-test runner treats plain ESM named exports as read-only
 * bindings, so vi.mock/vi.spyOn can't intercept a relative import).
 */
export const rateLimit = {
  isPrimaryLimitCloseToBeingBreached,
  isSecondaryLimitBreached,
  checkRateLimit,
  updateRateLimit,
};
