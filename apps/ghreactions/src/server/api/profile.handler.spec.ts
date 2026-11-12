import { Profile } from '@org/ghreactions-github';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profileHandler, profiles } from './profile.handler';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

function row(id: string, total: number) {
  return { id, total } as Profile['issues'][number];
}

const profile: Profile = {
  username: 'JakeWharton',
  refreshedAt: '2026-11-12T00:00:00Z',
  status: 'ok',
  issues: [row('i1', 5)],
  pullRequests: [row('p1', 3)],
  issueComments: [],
  counts: { issues: 1, pullRequests: 1, issueComments: 0 },
};

const request = (username: string) => ({ params: { username } }) as any;

describe('profileHandler', () => {
  beforeEach(() => {
    profiles.get = vi.fn().mockResolvedValue(profile);
  });

  it("returns the stored spelling and the profile's lists", async () => {
    const res = makeRes();

    await profileHandler(request('jakewharton'), res, vi.fn());

    expect(profiles.get).toHaveBeenCalledWith('jakewharton');
    expect(res.json).toHaveBeenCalledWith({
      username: 'JakeWharton',
      refreshedAt: '2026-11-12T00:00:00Z',
      issues: [row('i1', 5)],
      pullRequests: [row('p1', 3)],
      issueComments: [],
    });
  });

  it.each([
    ['missing', undefined],
    ['not_found', { ...profile, status: 'not_found' }],
  ])('returns 404 when the profile is %s', async (_, stored) => {
    profiles.get = vi.fn().mockResolvedValue(stored);
    const res = makeRes();

    await profileHandler(request('tj'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 when Firestore fails', async () => {
    profiles.get = vi.fn().mockRejectedValue(new Error('unavailable'));
    const res = makeRes();

    await profileHandler(request('tj'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
