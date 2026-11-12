import { UserSummary } from '@org/ghreactions-github';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profiles } from './profile.handler';
import { usersHandler } from './users.handler';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

const request = (page?: string) =>
  ({ query: page === undefined ? {} : { page } }) as any;

const user: UserSummary = {
  username: 'gaearon',
  counts: { issues: 3, pullRequests: 2, issueComments: 1 },
  totalReactions: 900,
};

describe('usersHandler', () => {
  beforeEach(() => {
    profiles.rankedCount = vi.fn().mockResolvedValue(250);
    profiles.ranked = vi.fn().mockResolvedValue([user]);
  });

  it('returns the first page by default', async () => {
    const res = makeRes();

    await usersHandler(request(), res, vi.fn());

    expect(profiles.ranked).toHaveBeenCalledWith(0, 100);
    expect(res.json).toHaveBeenCalledWith({
      users: [user],
      page: 1,
      pageCount: 3,
    });
  });

  it('offsets later pages', async () => {
    const res = makeRes();

    await usersHandler(request('3'), res, vi.fn());

    expect(profiles.ranked).toHaveBeenCalledWith(200, 100);
  });

  it('serves an empty first page when nobody is ranked yet', async () => {
    profiles.rankedCount = vi.fn().mockResolvedValue(0);
    profiles.ranked = vi.fn().mockResolvedValue([]);
    const res = makeRes();

    await usersHandler(request(), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ users: [], page: 1, pageCount: 1 });
  });

  it('returns 404 past the last page', async () => {
    const res = makeRes();

    await usersHandler(request('4'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(profiles.ranked).not.toHaveBeenCalled();
  });

  it.each(['0', '-1', '1.5', 'abc'])(
    'returns 400 for page=%s',
    async (page) => {
      const res = makeRes();

      await usersHandler(request(page), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    },
  );

  it('returns 500 when Firestore fails', async () => {
    profiles.rankedCount = vi.fn().mockRejectedValue(new Error('unavailable'));
    const res = makeRes();

    await usersHandler(request(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
