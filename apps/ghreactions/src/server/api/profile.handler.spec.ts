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
  username: 'gaearon',
  refreshedAt: '2026-11-12T00:00:00Z',
  status: 'ok',
  issues: [row('i1', 5), row('i2', 0)],
  pullRequests: [row('p1', 3)],
  issueComments: [row('c1', 0)],
  commitComments: [row('cc1', 9)],
};

describe('profileHandler', () => {
  beforeEach(() => {
    profiles.get = vi.fn().mockResolvedValue(profile);
  });

  it('returns the tracked spelling and only rows with reactions', async () => {
    const res = makeRes();

    await profileHandler(
      { params: { username: 'JakeWharton' } } as any,
      res,
      vi.fn(),
    );

    expect(profiles.get).toHaveBeenCalledWith('JakeWharton');
    expect(res.json).toHaveBeenCalledWith({
      username: 'JakeWharton',
      refreshedAt: '2026-11-12T00:00:00Z',
      issues: [row('i1', 5)],
      pullRequests: [row('p1', 3)],
      issueComments: [],
    });
  });

  it('matches the username case-insensitively', async () => {
    const res = makeRes();

    await profileHandler(
      { params: { username: 'GAEARON' } } as any,
      res,
      vi.fn(),
    );

    expect(profiles.get).toHaveBeenCalledWith('gaearon');
  });

  it('returns 404 for an untracked user without reading Firestore', async () => {
    const res = makeRes();

    await profileHandler(
      { params: { username: 'nobody' } } as any,
      res,
      vi.fn(),
    );

    expect(profiles.get).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it.each([
    ['missing', undefined],
    ['not_found', { ...profile, status: 'not_found' }],
  ])('returns 404 when the profile is %s', async (_, stored) => {
    profiles.get = vi.fn().mockResolvedValue(stored);
    const res = makeRes();

    await profileHandler({ params: { username: 'tj' } } as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 when Firestore fails', async () => {
    profiles.get = vi.fn().mockRejectedValue(new Error('unavailable'));
    const res = makeRes();

    await profileHandler({ params: { username: 'tj' } } as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
