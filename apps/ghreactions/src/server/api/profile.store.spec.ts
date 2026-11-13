import { ProfileFields } from '@org/ghreactions-github';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// A stand-in Firestore: one collection whose query returns `documents`, and
// one document whose create/update are spies.
const firestore = vi.hoisted(() => {
  const state = {
    documents: [] as Record<string, unknown>[],
    create: vi.fn(),
    update: vi.fn(),
    where: vi.fn(),
    doc: vi.fn(),
  };
  const query = {
    select: () => query,
    get: async () => ({
      docs: state.documents.map((data) => ({ data: () => data })),
    }),
  };
  state.where.mockReturnValue(query);
  state.doc.mockReturnValue({ create: state.create, update: state.update });
  return state;
});

vi.mock('firebase-admin/firestore', async (original) => ({
  ...(await original<typeof import('firebase-admin/firestore')>()),
  getFirestore: () => ({
    collection: () => ({ where: firestore.where, doc: firestore.doc }),
  }),
}));

const summary = (username: string, totalReactions: number, extra = {}) => ({
  username,
  counts: { issues: 1, pullRequests: 0, issueComments: 0 },
  reactions: { issues: totalReactions, pullRequests: 0, issueComments: 0 },
  totalReactions,
  ...extra,
});

/** A fresh module each time, so one test's cached ranking can't reach the next. */
async function load() {
  vi.resetModules();
  return (await import('./profile.handler')).profiles;
}

describe('profiles.ranked', () => {
  beforeEach(() => {
    vi.useRealTimers();
    firestore.where.mockClear();
  });

  it('ranks by reactions, leaving out snapshots someone asked for', async () => {
    firestore.documents = [
      summary('b-second', 200, { ranked: true }),
      summary('requested', 900, { ranked: false }),
      // Written before the flag existed: ranked.
      summary('a-first', 500),
    ];
    const profiles = await load();

    expect(await profiles.ranked()).toEqual([
      { ...summary('a-first', 500), rank: 1 },
      { ...summary('b-second', 200), rank: 2 },
    ]);
    expect(firestore.where).toHaveBeenCalledWith('totalReactions', '>=', 50);
  });

  it('orders a tie by username, so ranks are stable', async () => {
    firestore.documents = [summary('zed', 100), summary('amy', 100)];
    const profiles = await load();

    expect((await profiles.ranked()).map((u) => u.username)).toEqual([
      'amy',
      'zed',
    ]);
  });

  it('reads once and reuses the result for five minutes', async () => {
    vi.useFakeTimers();
    firestore.documents = [summary('amy', 100)];
    const profiles = await load();

    await profiles.ranked();
    vi.advanceTimersByTime(4 * 60 * 1000);
    await profiles.ranked();
    expect(firestore.where).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2 * 60 * 1000);
    await profiles.ranked();
    expect(firestore.where).toHaveBeenCalledTimes(2);
  });

  it('does not keep a failed read', async () => {
    const profiles = await load();
    firestore.where.mockImplementationOnce(() => ({
      select: () => ({ get: () => Promise.reject(new Error('unavailable')) }),
    }));

    await expect(profiles.ranked()).rejects.toThrow('unavailable');

    firestore.documents = [summary('amy', 100)];
    expect(await profiles.ranked()).toHaveLength(1);
  });
});

describe('profiles.store', () => {
  const fields: ProfileFields = {
    username: 'NewUser',
    status: 'ok',
    issues: [],
    pullRequests: [],
    issueComments: [],
    counts: { issues: 0, pullRequests: 0, issueComments: 0 },
    reactions: { issues: 0, pullRequests: 0, issueComments: 0 },
    totalReactions: 0,
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-11-13T00:00:00Z') });
    firestore.create.mockReset();
    firestore.update.mockReset();
    firestore.doc.mockClear();
  });

  it('creates an unranked document that expires in 30 days', async () => {
    const profiles = await load();

    await profiles.store(fields);

    expect(firestore.doc).toHaveBeenCalledWith('newuser');
    const written = firestore.create.mock.calls[0][0];
    expect(written).toMatchObject({ username: 'NewUser', ranked: false });
    expect(written.expireAt.toDate().toISOString()).toBe(
      '2026-12-13T00:00:00.000Z',
    );
    expect(firestore.update).not.toHaveBeenCalled();
  });

  it('only refreshes a document that already exists, keeping its flag and expiry', async () => {
    firestore.create.mockRejectedValue(Object.assign(new Error(), { code: 6 }));
    const profiles = await load();

    await profiles.store(fields);

    const written = firestore.update.mock.calls[0][0];
    expect(written).toMatchObject({ status: 'ok', totalReactions: 0 });
    for (const kept of ['username', 'ranked', 'expireAt', 'created']) {
      expect(written).not.toHaveProperty(kept);
    }
  });

  it('rethrows any other failure', async () => {
    firestore.create.mockRejectedValue(new Error('unavailable'));
    const profiles = await load();

    await expect(profiles.store(fields)).rejects.toThrow('unavailable');
    expect(firestore.update).not.toHaveBeenCalled();
  });
});
