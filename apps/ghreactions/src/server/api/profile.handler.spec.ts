import { GHReactionsRow, ReadProfile } from '@org/ghreactions-github';
import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profileHandler, profiles } from './profile.handler';

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
      totalReactions: 8,
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
