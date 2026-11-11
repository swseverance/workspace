import {
  Profile,
  profileApi,
  rateLimit,
  RateLimitError,
} from '@org/ghreactions-github';
import { refreshUser } from './refresh';

const profile: Profile = {
  username: 'octocat',
  refreshedAt: '2026-11-11T12:00:00.000Z',
  status: 'ok',
  issues: [],
  pullRequests: [],
  issueComments: [],
  commitComments: [],
};

beforeEach(() => {
  rateLimit.checkRateLimit = vi.fn().mockResolvedValue(undefined);
  profileApi.fetchProfile = vi.fn().mockResolvedValue(profile);
});

describe('refreshUser', () => {
  it('writes the fetched profile', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    await refreshUser('octocat', write);
    expect(profileApi.fetchProfile).toHaveBeenCalledWith('octocat');
    expect(write).toHaveBeenCalledWith(profile);
  });

  it('skips without fetching while GitHub calls are paused', async () => {
    rateLimit.checkRateLimit = vi
      .fn()
      .mockRejectedValue(new RateLimitError(123));
    const write = vi.fn();
    await refreshUser('octocat', write);
    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('skips without writing when rate limited mid-fetch', async () => {
    profileApi.fetchProfile = vi
      .fn()
      .mockRejectedValue(new RateLimitError(123));
    const write = vi.fn();
    await refreshUser('octocat', write);
    expect(write).not.toHaveBeenCalled();
  });

  it('rethrows other errors', async () => {
    profileApi.fetchProfile = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(refreshUser('octocat', vi.fn())).rejects.toThrow('boom');
  });
});
