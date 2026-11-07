import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitError } from '../../../models/errors';
import {
  checkRateLimit,
  isPrimaryLimitCloseToBeingBreached,
  isSecondaryLimitBreached,
  updateRateLimit,
} from './rate-limit';

const { mockHget, mockHmget, mockHset } = vi.hoisted(() => ({
  mockHget: vi.fn(),
  mockHmget: vi.fn(),
  mockHset: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn().mockReturnValue({
      hget: mockHget,
      hmget: mockHmget,
      hset: mockHset,
    }),
  },
}));

function makeResponse(options: {
  status?: number;
  remaining?: number;
  remainingHeaderMissing?: boolean;
  hasRetryAfter?: boolean;
}): Response {
  const {
    status = 200,
    remaining = 4000,
    remainingHeaderMissing = false,
    hasRetryAfter = false,
  } = options;
  return {
    status,
    headers: {
      get: (k: string) =>
        k === 'x-ratelimit-remaining' && !remainingHeaderMissing
          ? String(remaining)
          : null,
      has: (k: string) => k === 'retry-after' && hasRetryAfter,
    },
  } as unknown as Response;
}

beforeEach(() => vi.clearAllMocks());

describe('isPrimaryLimitCloseToBeingBreached', () => {
  it('returns false when remaining is above threshold', () => {
    expect(
      isPrimaryLimitCloseToBeingBreached(makeResponse({ remaining: 4000 })),
    ).toBe(false);
  });

  it('returns false when remaining equals threshold', () => {
    expect(
      isPrimaryLimitCloseToBeingBreached(makeResponse({ remaining: 100 })),
    ).toBe(false);
  });

  it('returns true when remaining is below threshold', () => {
    expect(
      isPrimaryLimitCloseToBeingBreached(makeResponse({ remaining: 99 })),
    ).toBe(true);
  });

  it('returns true when remaining is 0', () => {
    expect(
      isPrimaryLimitCloseToBeingBreached(makeResponse({ remaining: 0 })),
    ).toBe(true);
  });

  it('returns false when the header is missing (e.g. an auth failure response)', () => {
    expect(
      isPrimaryLimitCloseToBeingBreached(
        makeResponse({ remainingHeaderMissing: true }),
      ),
    ).toBe(false);
  });
});

describe('isSecondaryLimitBreached', () => {
  it('returns false for a normal response', () => {
    expect(isSecondaryLimitBreached(makeResponse({}))).toBe(false);
  });

  it('returns true for status 403', () => {
    expect(isSecondaryLimitBreached(makeResponse({ status: 403 }))).toBe(true);
  });

  it('returns true for status 429', () => {
    expect(isSecondaryLimitBreached(makeResponse({ status: 429 }))).toBe(true);
  });

  it('returns true when retry-after header is present', () => {
    expect(
      isSecondaryLimitBreached(makeResponse({ hasRetryAfter: true })),
    ).toBe(true);
  });

  it('returns true when remaining is 0', () => {
    expect(isSecondaryLimitBreached(makeResponse({ remaining: 0 }))).toBe(true);
  });

  it('returns false when the header is missing (e.g. an auth failure response)', () => {
    expect(
      isSecondaryLimitBreached(makeResponse({ remainingHeaderMissing: true })),
    ).toBe(false);
  });
});

describe('checkRateLimit', () => {
  it('does not throw when no key exists', async () => {
    mockHget.mockResolvedValue(null);

    await expect(checkRateLimit()).resolves.toBeUndefined();
  });

  it('does not throw when remaining is above threshold', async () => {
    mockHget.mockResolvedValue(500);

    await expect(checkRateLimit()).resolves.toBeUndefined();
  });

  it('throws RateLimitError when remaining is below threshold', async () => {
    mockHget.mockResolvedValue(50);

    await expect(checkRateLimit()).rejects.toThrow(RateLimitError);
  });

  it('throws RateLimitError when remaining is 0', async () => {
    mockHget.mockResolvedValue(0);

    await expect(checkRateLimit()).rejects.toThrow(RateLimitError);
  });

  it('fails open when Redis throws', async () => {
    mockHget.mockRejectedValue(new Error('Redis unavailable'));

    await expect(checkRateLimit()).resolves.toBeUndefined();
  });
});

describe('updateRateLimit', () => {
  it('writes when no key exists', async () => {
    mockHmget.mockResolvedValue(null);

    await updateRateLimit(4000, 1700000000);

    expect(mockHset).toHaveBeenCalledWith('rate-limits:github', {
      remaining: 4000,
      reset: 1700000000,
    });
  });

  it('writes when incoming remaining is lower in the same reset window', async () => {
    mockHmget.mockResolvedValue({ remaining: 500, reset: 1700000000 });

    await updateRateLimit(400, 1700000000);

    expect(mockHset).toHaveBeenCalledWith('rate-limits:github', {
      remaining: 400,
      reset: 1700000000,
    });
  });

  it('skips write when incoming remaining is higher in the same reset window', async () => {
    mockHmget.mockResolvedValue({ remaining: 400, reset: 1700000000 });

    await updateRateLimit(500, 1700000000);

    expect(mockHset).not.toHaveBeenCalled();
  });

  it('skips write when incoming remaining equals current in the same reset window', async () => {
    mockHmget.mockResolvedValue({ remaining: 400, reset: 1700000000 });

    await updateRateLimit(400, 1700000000);

    expect(mockHset).not.toHaveBeenCalled();
  });

  it('writes when the reset window has changed', async () => {
    mockHmget.mockResolvedValue({ remaining: 400, reset: 1700000000 });

    await updateRateLimit(5000, 1700003600);

    expect(mockHset).toHaveBeenCalledWith('rate-limits:github', {
      remaining: 5000,
      reset: 1700003600,
    });
  });

  it('silently swallows Redis errors', async () => {
    mockHmget.mockRejectedValue(new Error('Redis unavailable'));

    await expect(updateRateLimit(4000, 1700000000)).resolves.toBeUndefined();
  });
});
