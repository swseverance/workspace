import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analyticsHandler } from './analytics.handler';

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(),
}));

import { getFirestore } from 'firebase-admin/firestore';

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

function makeCountSnapshot(count: number) {
  return { data: () => ({ count }) };
}

function makeFirestore(count: number) {
  const get = vi.fn().mockResolvedValue(makeCountSnapshot(count));
  const countFn = vi.fn().mockReturnValue({ get });
  const collection = vi.fn().mockReturnValue({ count: countFn });
  vi.mocked(getFirestore).mockReturnValue({ collection } as any);
  return { get };
}

describe('analyticsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns the number of users', async () => {
    makeFirestore(42);
    const res = makeRes();

    await analyticsHandler({} as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ users: 42 });
  });

  it('queries the users collection', async () => {
    const { get } = makeFirestore(0);
    await analyticsHandler({} as any, makeRes(), vi.fn());
    expect(vi.mocked(getFirestore)().collection).toHaveBeenCalledWith('users');
    expect(get).toHaveBeenCalled();
  });

  it('returns 500 when Firestore throws', async () => {
    vi.mocked(getFirestore).mockReturnValue({
      collection: vi.fn().mockReturnValue({
        count: vi
          .fn()
          .mockReturnValue({
            get: vi.fn().mockRejectedValue(new Error('unavailable')),
          }),
      }),
    } as any);
    const res = makeRes();

    await analyticsHandler({} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
