import { Redis } from '@upstash/redis';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RateLimitError } from '../../../models/errors';
import { redisProvider } from '../../redis/redis';
import {
  blockUntil,
  checkRateLimit,
  isRateLimited,
  retryAt,
} from './rate-limit';

// Provide a fake client so no real Upstash client is ever built.
let mockGet: Mock;
let mockSet: Mock;

const NOW = 1_700_000_000;

function makeResponse(
  options: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const { status = 200, headers = {} } = options;
  const map = new Map(Object.entries(headers));
  return {
    status,
    headers: {
      get: (k: string) => map.get(k) ?? null,
      has: (k: string) => map.has(k),
    },
  } as unknown as Response;
}

beforeEach(() => {
  mockGet = vi.fn().mockResolvedValue(null);
  mockSet = vi.fn().mockResolvedValue('OK');
  redisProvider.provide({ get: mockGet, set: mockSet } as unknown as Redis);
  vi.useFakeTimers();
  vi.setSystemTime(NOW * 1000);
  vi.stubEnv('FIREBASE_PROJECT_ID', 'proj');
  vi.stubEnv('ENVIRONMENT_NAME', 'test');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  redisProvider.reset();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('isRateLimited', () => {
  it('is false for a normal response', () => {
    const res = makeResponse({ headers: { 'x-ratelimit-remaining': '4000' } });
    expect(isRateLimited(res, { data: {} } as never)).toBe(false);
  });

  it('is true for 429', () => {
    expect(isRateLimited(makeResponse({ status: 429 }), null)).toBe(true);
  });

  it('is true when retry-after is present', () => {
    const res = makeResponse({ headers: { 'retry-after': '30' } });
    expect(isRateLimited(res, null)).toBe(true);
  });

  it('is true when remaining is 0 (GraphQL primary limit is a 200)', () => {
    const res = makeResponse({ headers: { 'x-ratelimit-remaining': '0' } });
    expect(isRateLimited(res, null)).toBe(true);
  });

  it('is true for a RATE_LIMITED GraphQL error', () => {
    expect(
      isRateLimited(makeResponse(), { errors: [{ type: 'RATE_LIMITED' }] }),
    ).toBe(true);
  });

  it('is true for a secondary-limit message body', () => {
    expect(
      isRateLimited(makeResponse({ status: 403 }), {
        message: 'You have exceeded a secondary rate limit.',
      }),
    ).toBe(true);
  });

  it('is false for a 403 that is not about rate limiting', () => {
    expect(
      isRateLimited(makeResponse({ status: 403 }), {
        message: 'Resource protected by organization SAML enforcement.',
      }),
    ).toBe(false);
  });

  it('is false when rate-limit headers are absent (e.g. an auth failure)', () => {
    expect(
      isRateLimited(makeResponse({ status: 401 }), {
        message: 'Bad credentials',
      }),
    ).toBe(false);
  });
});

describe('retryAt', () => {
  it('is null when plenty of the window remains', () => {
    const res = makeResponse({
      headers: {
        'x-ratelimit-remaining': '4000',
        'x-ratelimit-reset': String(NOW + 1800),
      },
    });
    expect(retryAt(res, null)).toBeNull();
  });

  it('is null when rate-limit headers are absent', () => {
    expect(retryAt(makeResponse({ status: 401 }), null)).toBeNull();
  });

  it('prefers retry-after', () => {
    const res = makeResponse({
      headers: {
        'retry-after': '30',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(NOW + 1800),
      },
    });
    expect(retryAt(res, null)).toBe(NOW + 30);
  });

  it('waits for the reset once remaining drops below the threshold', () => {
    const res = makeResponse({
      headers: {
        'x-ratelimit-remaining': '99',
        'x-ratelimit-reset': String(NOW + 1800),
      },
    });
    expect(retryAt(res, null)).toBe(NOW + 1800);
  });

  it('falls back to one minute when the reset is missing or already past', () => {
    const res = makeResponse({
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(NOW - 5),
      },
    });
    expect(retryAt(res, null)).toBe(NOW + 60);
  });

  it('waits one minute for a rate limit with no timing headers', () => {
    expect(
      retryAt(makeResponse(), { errors: [{ type: 'RATE_LIMITED' }] }),
    ).toBe(NOW + 60);
  });

  it('never waits longer than an hour', () => {
    const res = makeResponse({ headers: { 'retry-after': '999999' } });
    expect(retryAt(res, null)).toBe(NOW + 3600);
  });
});

describe('checkRateLimit', () => {
  it('passes when nothing is blocked', async () => {
    mockGet.mockResolvedValue(null);
    await expect(checkRateLimit()).resolves.toBeUndefined();
  });

  it('passes once the block has expired', async () => {
    mockGet.mockResolvedValue(NOW - 1);
    await expect(checkRateLimit()).resolves.toBeUndefined();
  });

  it('throws RateLimitError carrying the retry time while blocked', async () => {
    mockGet.mockResolvedValue(NOW + 120);
    const error = await checkRateLimit().catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error).toMatchObject({ retryAt: NOW + 120 });
  });

  it('fails open when Redis throws', async () => {
    mockGet.mockRejectedValue(new Error('Redis unavailable'));
    await expect(checkRateLimit()).resolves.toBeUndefined();
  });
});

describe('blockUntil', () => {
  it('stores the time with a matching expiry', async () => {
    await blockUntil(NOW + 120);
    expect(mockSet).toHaveBeenCalledWith(
      'proj:test:github:blocked-until',
      NOW + 120,
      {
        exat: NOW + 120,
      },
    );
  });

  it('skips times that are not in the future', async () => {
    await blockUntil(NOW);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('swallows Redis errors', async () => {
    mockSet.mockRejectedValue(new Error('Redis unavailable'));
    await expect(blockUntil(NOW + 120)).resolves.toBeUndefined();
  });
});
