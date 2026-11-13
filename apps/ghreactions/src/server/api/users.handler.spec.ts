import { UserSummary } from '@org/ghreactions-github';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { profiles } from './profile.handler';
import { usersHandler } from './users.handler';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

// Spec files share modules here, so put back whatever the tests replace:
// other files test the real thing.
const realRanked = profiles.ranked;

afterEach(() => {
  profiles.ranked = realRanked;
});

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

const request = (query: Record<string, unknown> = {}) => ({ query }) as any;

const user = (username: string, rank: number): UserSummary => ({
  username,
  counts: { issues: 3, pullRequests: 2, issueComments: 1 },
  reactions: { issues: 600, pullRequests: 250, issueComments: 50 },
  totalReactions: 900,
  rank,
});

/** 250 ranked users: user1 ... user250, plus two named ones at the front. */
const ranked = [
  user('Gaearon', 1),
  user('gaborcsardi', 2),
  ...Array.from({ length: 248 }, (_, i) => user(`user${i + 1}`, i + 3)),
];

describe('usersHandler', () => {
  beforeEach(() => {
    profiles.ranked = vi.fn().mockResolvedValue(ranked);
  });

  it('returns the first page by default', async () => {
    const res = makeRes();

    await usersHandler(request(), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      users: ranked.slice(0, 100),
      page: 1,
      pageCount: 3,
    });
  });

  it('returns later pages, the last one short', async () => {
    const res = makeRes();

    await usersHandler(request({ page: '3' }), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      users: ranked.slice(200),
      page: 3,
      pageCount: 3,
    });
  });

  it('serves an empty first page when nobody is ranked yet', async () => {
    profiles.ranked = vi.fn().mockResolvedValue([]);
    const res = makeRes();

    await usersHandler(request(), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ users: [], page: 1, pageCount: 1 });
  });

  it('returns 404 past the last page', async () => {
    const res = makeRes();

    await usersHandler(request({ page: '4' }), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it.each(['0', '-1', '1.5', 'abc'])(
    'returns 400 for page=%s',
    async (page) => {
      const res = makeRes();

      await usersHandler(request({ page }), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    },
  );

  describe('with q', () => {
    it('returns the users starting with it, any case, keeping their ranks', async () => {
      const res = makeRes();

      await usersHandler(request({ q: 'GA' }), res, vi.fn());

      expect(res.json).toHaveBeenCalledWith({
        users: [user('Gaearon', 1), user('gaborcsardi', 2)],
        page: 1,
        pageCount: 1,
      });
    });

    it('returns at most one page of matches', async () => {
      const res = makeRes();

      await usersHandler(request({ q: 'user' }), res, vi.fn());

      const body = res.json.mock.calls[0][0];
      expect(body.users).toHaveLength(100);
      expect(body.pageCount).toBe(1);
    });

    it.each(['dan abramov', '@gaearon', 'a/b', 'x'.repeat(40)])(
      'matches nobody for %s, which no username can start with',
      async (q) => {
        const res = makeRes();

        await usersHandler(request({ q }), res, vi.fn());

        expect(res.json).toHaveBeenCalledWith({
          users: [],
          page: 1,
          pageCount: 1,
        });
      },
    );

    it.each([[''], [['a', 'b']]])('returns 400 for q=%j', async (q) => {
      const res = makeRes();

      await usersHandler(request({ q }), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  it("returns 500 when the ranking can't be read", async () => {
    profiles.ranked = vi.fn().mockRejectedValue(new Error('unavailable'));
    const res = makeRes();

    await usersHandler(request(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
