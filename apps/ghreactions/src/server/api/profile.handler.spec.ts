import {
  GHReactionsRow,
  profileApi,
  ProfileFields,
  rateLimit,
  RateLimitError,
  ReadProfile,
} from '@org/ghreactions-github';
import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildProfileHandler,
  profileHandler,
  profiles,
  toProfile,
} from './profile.handler';
import { snapshotQuota } from './snapshot-quota';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

function row(id: string, total: number) {
  return { id, total } as GHReactionsRow;
}

const at = (iso: string) => Timestamp.fromDate(new Date(iso));

const profile: ReadProfile = {
  username: 'JakeWharton',
  status: 'ok',
  issues: [row('i1', 5)],
  pullRequests: [row('p1', 3)],
  issueComments: [],
  counts: { issues: 1, pullRequests: 1, issueComments: 0 },
  reactions: { issues: 5, pullRequests: 3, issueComments: 0 },
  totalReactions: 8,
  created: at('2026-11-11T00:00:00Z'),
  lastUpdated: at('2026-11-12T00:00:00Z'),
  lastFetched: at('2026-11-12T00:00:00Z'),
};

const request = (username: string) => ({ params: { username } }) as any;

describe('profileHandler', () => {
  beforeEach(() => {
    profiles.get = vi.fn().mockResolvedValue(profile);
  });

  it('returns the profile with ISO timestamps', async () => {
    const res = makeRes();

    await profileHandler(request('jakewharton'), res, vi.fn());

    expect(profiles.get).toHaveBeenCalledWith('jakewharton');
    expect(res.json).toHaveBeenCalledWith({
      username: 'JakeWharton',
      status: 'ok',
      issues: [row('i1', 5)],
      pullRequests: [row('p1', 3)],
      issueComments: [],
      counts: { issues: 1, pullRequests: 1, issueComments: 0 },
      reactions: { issues: 5, pullRequests: 3, issueComments: 0 },
      totalReactions: 8,
      ranked: true,
      created: '2026-11-11T00:00:00.000Z',
      lastUpdated: '2026-11-12T00:00:00.000Z',
      lastFetched: '2026-11-12T00:00:00.000Z',
    });
  });

  it.each([
    ['missing', undefined],
    ['pending', { ...profile, status: 'pending', lastFetched: null }],
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

describe('toProfile', () => {
  it('reports a snapshot someone asked for as unranked, without its expiry', () => {
    const result = toProfile({
      ...profile,
      ranked: false,
      expireAt: at('2026-12-13T00:00:00Z'),
    });

    expect(result.ranked).toBe(false);
    expect(result).not.toHaveProperty('expireAt');
  });

  it('treats a document with no flag as ranked', () => {
    expect(toProfile(profile).ranked).toBe(true);
  });
});

describe('buildProfileHandler', () => {
  const { created: _c, lastUpdated: _u, lastFetched: _f, ...fields } = profile;
  const fetched: ProfileFields = { ...fields, username: 'newuser' };
  const stored: ReadProfile = {
    ...profile,
    username: 'newuser',
    ranked: false,
  };

  beforeEach(() => {
    // Nothing stored until store() runs.
    let saved: ReadProfile | undefined;
    profiles.get = vi.fn(async () => saved);
    profiles.store = vi.fn(async () => {
      saved = stored;
    });
    snapshotQuota.take = vi.fn().mockResolvedValue(true);
    rateLimit.checkRateLimit = vi.fn().mockResolvedValue(undefined);
    profileApi.fetchProfile = vi.fn().mockResolvedValue(fetched);
  });

  it('fetches a new user in parallel, stores the snapshot and returns it', async () => {
    const res = makeRes();

    await buildProfileHandler(request('newuser'), res, vi.fn());

    expect(profileApi.fetchProfile).toHaveBeenCalledWith('newuser', {
      parallel: true,
    });
    expect(profiles.store).toHaveBeenCalledWith(fetched);
    expect(res.json).toHaveBeenCalledWith(toProfile(stored));
  });

  it('returns an existing snapshot without fetching or using the quota', async () => {
    profiles.get = vi.fn().mockResolvedValue(profile);
    const res = makeRes();

    await buildProfileHandler(request('jakewharton'), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(toProfile(profile));
    expect(snapshotQuota.take).not.toHaveBeenCalled();
    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
  });

  it('builds a ranked user who has not been refreshed yet, outside the quota', async () => {
    const pending = { ...profile, status: 'pending', lastFetched: null };
    profiles.get = vi
      .fn()
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(profile);
    const res = makeRes();

    await buildProfileHandler(request('jakewharton'), res, vi.fn());

    expect(snapshotQuota.take).not.toHaveBeenCalled();
    expect(profiles.store).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(toProfile(profile));
  });

  it("returns 429 once the day's new snapshots are used up", async () => {
    snapshotQuota.take = vi.fn().mockResolvedValue(false);
    const res = makeRes();

    await buildProfileHandler(request('newuser'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(429);
    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
  });

  it('returns 404 without storing anything when GitHub has no such user', async () => {
    profileApi.fetchProfile = vi
      .fn()
      .mockResolvedValue({ ...fetched, status: 'not_found' });
    const res = makeRes();

    await buildProfileHandler(request('newuser'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(profiles.store).not.toHaveBeenCalled();
  });

  it.each(['-leading-hyphen', 'has space', 'a/b', 'x'.repeat(40), ''])(
    'returns 400 for "%s", which is not a username',
    async (username) => {
      const res = makeRes();

      await buildProfileHandler(request(username), res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(profiles.get).not.toHaveBeenCalled();
    },
  );

  it('returns 429 with Retry-After while GitHub calls are paused', async () => {
    const retryAt = Math.floor(Date.now() / 1000) + 90;
    rateLimit.checkRateLimit = vi
      .fn()
      .mockRejectedValue(new RateLimitError(retryAt));
    const res = makeRes();
    res.set = vi.fn().mockReturnValue(res);

    await buildProfileHandler(request('newuser'), res, vi.fn());

    expect(res.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(429);
    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
  });

  it('returns 500 when the fetch fails', async () => {
    profileApi.fetchProfile = vi.fn().mockRejectedValue(new Error('boom'));
    const res = makeRes();

    await buildProfileHandler(request('newuser'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
