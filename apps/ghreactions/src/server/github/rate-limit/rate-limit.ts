import * as logger from 'firebase-functions/logger';
import { RateLimitError } from '../../../models/errors';
import { redis, redisKey } from '../../redis/redis';
import { serializeError } from '../../serialize-error';

// Stop calling GitHub once fewer than this many points remain in the window,
// leaving headroom for requests already in flight.
const THRESHOLD = 100;
// GitHub's guidance when a limit is hit without an explicit retry time.
const DEFAULT_BACKOFF_SECONDS = 60;
// Primary windows are hourly, so no legitimate wait is longer than this.
const MAX_BACKOFF_SECONDS = 60 * 60;

const blockedUntilKey = () => redisKey('github:blocked-until');

export type GitHubErrorBody = {
  message?: string;
  errors?: { type?: string; message?: string }[];
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

function numericHeader(res: Response, name: string): number | null {
  const value = res.headers.get(name);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const mentionsRateLimit = (message?: string) =>
  message !== undefined && /rate limit/i.test(message);

/**
 * Whether this response is GitHub refusing the request because of a primary
 * or secondary rate limit. GraphQL reports these as 200 (or 403) with an
 * error body, not just via status codes.
 */
export function isRateLimited(
  res: Response,
  body: GitHubErrorBody | null,
): boolean {
  return (
    res.status === 429 ||
    res.headers.has('retry-after') ||
    numericHeader(res, 'x-ratelimit-remaining') === 0 ||
    mentionsRateLimit(body?.message) ||
    (body?.errors ?? []).some(
      (e) => e.type === 'RATE_LIMITED' || mentionsRateLimit(e.message),
    )
  );
}

/**
 * The epoch second before which GitHub shouldn't be called again, following
 * GitHub's documented order: `retry-after`, then `x-ratelimit-reset` once the
 * window is (nearly) spent, then a one-minute default. Null if no wait is needed.
 */
export function retryAt(
  res: Response,
  body: GitHubErrorBody | null,
): number | null {
  const now = nowSeconds();
  const cap = (at: number) => Math.min(at, now + MAX_BACKOFF_SECONDS);

  const retryAfter = numericHeader(res, 'retry-after');
  if (retryAfter !== null) return cap(now + retryAfter);

  const remaining = numericHeader(res, 'x-ratelimit-remaining');
  if (remaining !== null && remaining < THRESHOLD) {
    const reset = numericHeader(res, 'x-ratelimit-reset');
    return cap(
      reset !== null && reset > now ? reset : now + DEFAULT_BACKOFF_SECONDS,
    );
  }

  if (isRateLimited(res, body)) return now + DEFAULT_BACKOFF_SECONDS;

  return null;
}

/** Throws RateLimitError if GitHub calls are currently paused. */
export async function checkRateLimit(): Promise<void> {
  let blockedUntil: number | null;
  try {
    blockedUntil = await redis.get<number>(blockedUntilKey());
  } catch (err) {
    logger.error('[GitHub rate limit] read failed:', serializeError(err));
    return; // fail open
  }

  if (blockedUntil !== null && blockedUntil > nowSeconds()) {
    throw new RateLimitError(blockedUntil);
  }
}

/** Pauses GitHub calls across all instances until the given epoch second. */
export async function blockUntil(until: number): Promise<void> {
  if (until <= nowSeconds()) return;
  try {
    await redis.set(blockedUntilKey(), until, { exat: until });
  } catch (err) {
    logger.error('[GitHub rate limit] write failed:', serializeError(err));
  }
}

/**
 * Object wrapper so cross-module consumers can monkey-patch these in tests
 * (the Angular unit-test runner treats plain ESM named exports as read-only
 * bindings, so vi.mock/vi.spyOn can't intercept a relative import).
 */
export const rateLimit = {
  isRateLimited,
  retryAt,
  checkRateLimit,
  blockUntil,
};
