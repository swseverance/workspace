import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitError } from '../../../models/errors';
import {
  checkRateLimit,
  isPrimaryLimitCloseToBeingBreached,
  isSecondaryLimitBreached,
  updateRateLimit,
} from './rate-limit';

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(),
}));

import { getFirestore } from 'firebase-admin/firestore';

function makeDoc(data: { remaining: number; reset?: number } | null) {
  return {
    exists: data !== null,
    data: () => data,
  };
}

function makeFirestore(doc: ReturnType<typeof makeDoc>) {
  return {
    doc: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue(doc),
      set: vi.fn().mockResolvedValue(undefined),
    }),
  };
}

function makeTransactionFirestore(doc: ReturnType<typeof makeDoc>) {
  const tSet = vi.fn();
  const runTransaction = vi
    .fn()
    .mockImplementation(async (fn: (t: any) => Promise<void>) => {
      await fn({ get: vi.fn().mockResolvedValue(doc), set: tSet });
    });
  vi.mocked(getFirestore).mockReturnValue({
    doc: vi.fn().mockReturnValue({ firestore: { runTransaction } }),
  } as any);
  return { tSet, runTransaction };
}

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
  it('does not throw when no document exists', async () => {
    vi.mocked(getFirestore).mockReturnValue(
      makeFirestore(makeDoc(null)) as any,
    );

    await expect(checkRateLimit()).resolves.toBeUndefined();
  });

  it('does not throw when remaining is above threshold', async () => {
    vi.mocked(getFirestore).mockReturnValue(
      makeFirestore(makeDoc({ remaining: 500 })) as any,
    );

    await expect(checkRateLimit()).resolves.toBeUndefined();
  });

  it('throws RateLimitError when remaining is below threshold', async () => {
    vi.mocked(getFirestore).mockReturnValue(
      makeFirestore(makeDoc({ remaining: 50 })) as any,
    );

    await expect(checkRateLimit()).rejects.toThrow(RateLimitError);
  });

  it('throws RateLimitError when remaining is 0', async () => {
    vi.mocked(getFirestore).mockReturnValue(
      makeFirestore(makeDoc({ remaining: 0 })) as any,
    );

    await expect(checkRateLimit()).rejects.toThrow(RateLimitError);
  });

  it('fails open when Firestore throws', async () => {
    vi.mocked(getFirestore).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('Firestore unavailable')),
      }),
    } as any);

    await expect(checkRateLimit()).resolves.toBeUndefined();
  });
});

describe('updateRateLimit', () => {
  it('writes when no document exists', async () => {
    const { tSet, runTransaction } = makeTransactionFirestore(makeDoc(null));
    updateRateLimit(4000, 1700000000);
    await runTransaction.mock.results[0].value;
    expect(tSet).toHaveBeenCalledWith(expect.anything(), {
      remaining: 4000,
      reset: 1700000000,
    });
  });

  it('writes when incoming remaining is lower in the same reset window', async () => {
    const { tSet, runTransaction } = makeTransactionFirestore(
      makeDoc({ remaining: 500, reset: 1700000000 }),
    );
    updateRateLimit(400, 1700000000);
    await runTransaction.mock.results[0].value;
    expect(tSet).toHaveBeenCalledWith(expect.anything(), {
      remaining: 400,
      reset: 1700000000,
    });
  });

  it('skips write when incoming remaining is higher in the same reset window', async () => {
    const { tSet, runTransaction } = makeTransactionFirestore(
      makeDoc({ remaining: 400, reset: 1700000000 }),
    );
    updateRateLimit(500, 1700000000);
    await runTransaction.mock.results[0].value;
    expect(tSet).not.toHaveBeenCalled();
  });

  it('skips write when incoming remaining equals current in the same reset window', async () => {
    const { tSet, runTransaction } = makeTransactionFirestore(
      makeDoc({ remaining: 400, reset: 1700000000 }),
    );
    updateRateLimit(400, 1700000000);
    await runTransaction.mock.results[0].value;
    expect(tSet).not.toHaveBeenCalled();
  });

  it('writes when the reset window has changed', async () => {
    const { tSet, runTransaction } = makeTransactionFirestore(
      makeDoc({ remaining: 400, reset: 1700000000 }),
    );
    updateRateLimit(5000, 1700003600);
    await runTransaction.mock.results[0].value;
    expect(tSet).toHaveBeenCalledWith(expect.anything(), {
      remaining: 5000,
      reset: 1700003600,
    });
  });

  it('silently swallows transaction errors', () => {
    const runTransaction = vi
      .fn()
      .mockRejectedValue(new Error('transaction failed'));
    vi.mocked(getFirestore).mockReturnValue({
      doc: vi.fn().mockReturnValue({ firestore: { runTransaction } }),
    } as any);
    expect(() => updateRateLimit(4000, 1700000000)).not.toThrow();
  });
});
