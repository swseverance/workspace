import { getFirestore } from 'firebase-admin/firestore';
import { RateLimitError } from '../../../models/errors';
import type { RateLimitData, RateLimitWrite } from '../../../models/firebase';

const THRESHOLD = 100;

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
    const doc = await getFirestore().doc('rate-limits/github').get();
    if (!doc.exists) return;
    const { remaining } = doc.data() as RateLimitData;
    if (remaining < THRESHOLD) throw new RateLimitError();
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Firestore unavailable — fail open
  }
}

export function updateRateLimit(remaining: number, reset: number): void {
  const ref = getFirestore().doc('rate-limits/github');
  ref.firestore
    .runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (doc.exists) {
        const current = doc.data() as RateLimitData;
        if (current.reset === reset && current.remaining <= remaining) return;
      }
      t.set(ref, { remaining, reset } satisfies RateLimitWrite);
    })
    .catch(() => {});
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
