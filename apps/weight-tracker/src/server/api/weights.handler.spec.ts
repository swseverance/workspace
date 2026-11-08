import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteWeightHandler,
  isValidDate,
  listWeightsHandler,
  upsertWeightHandler,
} from './weights.handler';

const firestore = vi.hoisted(() => {
  const doc = { set: vi.fn(), delete: vi.fn() };
  const weights = {
    orderBy: vi.fn(),
    get: vi.fn(),
    doc: vi.fn(() => doc),
  };
  weights.orderBy.mockReturnValue(weights);
  const users = { doc: vi.fn(() => ({ collection: vi.fn(() => weights) })) };
  return { doc, weights, users, collection: vi.fn(() => users) };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection: firestore.collection }),
}));
vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

function makeReq(overrides: Record<string, unknown> = {}) {
  return { user: { uid: 'u1' }, params: {}, body: {}, ...overrides } as any;
}

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn(), end: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
  firestore.weights.orderBy.mockReturnValue(firestore.weights);
});

describe('isValidDate', () => {
  it.each(['2025-01-31', '2024-02-29'])('accepts %s', (date) => {
    expect(isValidDate(date)).toBe(true);
  });

  it.each(['2025-02-30', '2025-1-01', '2025-01-01/x', '', 20250101])(
    'rejects %s',
    (date) => {
      expect(isValidDate(date)).toBe(false);
    },
  );
});

describe('listWeightsHandler', () => {
  it("returns the user's entries newest first", async () => {
    firestore.weights.get.mockResolvedValue({
      docs: [
        { id: '2025-01-02', data: () => ({ date: '2025-01-02', weight: 180 }) },
      ],
    });
    const res = makeRes();

    await listWeightsHandler(makeReq(), res, vi.fn());

    expect(firestore.collection).toHaveBeenCalledWith('users');
    expect(firestore.users.doc).toHaveBeenCalledWith('u1');
    expect(firestore.weights.orderBy).toHaveBeenCalledWith('date', 'desc');
    expect(res.json).toHaveBeenCalledWith({
      entries: [{ id: '2025-01-02', date: '2025-01-02', weight: 180 }],
    });
  });

  it('returns 500 when Firestore fails', async () => {
    firestore.weights.get.mockRejectedValue(new Error('boom'));
    const res = makeRes();

    await listWeightsHandler(makeReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('upsertWeightHandler', () => {
  it('saves and returns the entry', async () => {
    firestore.doc.set.mockResolvedValue(undefined);
    const res = makeRes();

    await upsertWeightHandler(
      makeReq({ params: { date: '2025-01-02' }, body: { weight: 180.4 } }),
      res,
      vi.fn(),
    );

    const entry = { id: '2025-01-02', date: '2025-01-02', weight: 180.4 };
    expect(firestore.weights.doc).toHaveBeenCalledWith('2025-01-02');
    expect(firestore.doc.set).toHaveBeenCalledWith(entry);
    expect(res.json).toHaveBeenCalledWith(entry);
  });

  it('returns 400 for an invalid date', async () => {
    const res = makeRes();

    await upsertWeightHandler(
      makeReq({ params: { date: 'nope' }, body: { weight: 180 } }),
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(firestore.doc.set).not.toHaveBeenCalled();
  });

  it.each([undefined, '180', 0, -5, Number.NaN, 5000])(
    'returns 400 for weight %s',
    async (weight) => {
      const res = makeRes();

      await upsertWeightHandler(
        makeReq({ params: { date: '2025-01-02' }, body: { weight } }),
        res,
        vi.fn(),
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(firestore.doc.set).not.toHaveBeenCalled();
    },
  );
});

describe('deleteWeightHandler', () => {
  it('deletes the entry', async () => {
    firestore.doc.delete.mockResolvedValue(undefined);
    const res = makeRes();

    await deleteWeightHandler(
      makeReq({ params: { date: '2025-01-02' } }),
      res,
      vi.fn(),
    );

    expect(firestore.weights.doc).toHaveBeenCalledWith('2025-01-02');
    expect(firestore.doc.delete).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('returns 400 for an invalid date', async () => {
    const res = makeRes();

    await deleteWeightHandler(makeReq({ params: { date: 'x' } }), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(firestore.doc.delete).not.toHaveBeenCalled();
  });
});
