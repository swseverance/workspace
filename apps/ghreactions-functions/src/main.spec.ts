import {
  profileApi,
  ProfileFields,
  rateLimit,
  RateLimitError,
  topUsersApi,
} from '@org/ghreactions-github';
import { refreshProfile, trackTopUsers } from './main';
import { profileStore } from './profiles';

const event = { scheduleTime: '2026-11-12T06:00:00Z' } as Parameters<
  typeof trackTopUsers.run
>[0];

const profile: ProfileFields = {
  username: 'octocat',
  status: 'ok',
  issues: [],
  pullRequests: [],
  issueComments: [],
  counts: { issues: 0, pullRequests: 0, issueComments: 0 },
  totalReactions: 0,
};

beforeEach(() => {
  rateLimit.checkRateLimit = vi.fn().mockResolvedValue(undefined);
  topUsersApi.fetchTopUsers = vi.fn().mockResolvedValue(['a', 'b']);
  profileApi.fetchProfile = vi.fn().mockResolvedValue(profile);
  profileStore.addUsers = vi.fn().mockResolvedValue(1);
  profileStore.findStalest = vi.fn().mockResolvedValue('octocat');
  profileStore.write = vi.fn().mockResolvedValue(undefined);
  profileStore.touch = vi.fn().mockResolvedValue(undefined);
});

describe('refreshProfile', () => {
  it('fetches the claimed user and writes their profile', async () => {
    await refreshProfile.run(event);

    expect(profileApi.fetchProfile).toHaveBeenCalledWith('octocat');
    expect(profileStore.write).toHaveBeenCalledWith(profile);
  });

  it('does nothing when there are no profiles yet', async () => {
    profileStore.findStalest = vi.fn().mockResolvedValue(undefined);

    await refreshProfile.run(event);

    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
  });

  it('skips without fetching while GitHub calls are paused', async () => {
    rateLimit.checkRateLimit = vi
      .fn()
      .mockRejectedValue(new RateLimitError(123));

    await refreshProfile.run(event);

    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
    expect(profileStore.write).not.toHaveBeenCalled();
    // Left at the front, to retry next minute.
    expect(profileStore.touch).not.toHaveBeenCalled();
  });

  it('skips without writing when rate limited mid-fetch', async () => {
    profileApi.fetchProfile = vi
      .fn()
      .mockRejectedValue(new RateLimitError(123));

    await refreshProfile.run(event);

    expect(profileStore.write).not.toHaveBeenCalled();
  });

  it('sends the user to the back of the queue and rethrows other errors', async () => {
    profileApi.fetchProfile = vi.fn().mockRejectedValue(new Error('boom'));

    await expect(refreshProfile.run(event)).rejects.toThrow('boom');
    expect(profileStore.touch).toHaveBeenCalledWith('octocat');
  });
});

describe('trackTopUsers', () => {
  it('adds the most-followed users', async () => {
    await trackTopUsers.run(event);

    expect(profileStore.addUsers).toHaveBeenCalledWith(['a', 'b']);
  });

  it('skips without fetching while GitHub calls are paused', async () => {
    rateLimit.checkRateLimit = vi
      .fn()
      .mockRejectedValue(new RateLimitError(123));

    await trackTopUsers.run(event);

    expect(topUsersApi.fetchTopUsers).not.toHaveBeenCalled();
    expect(profileStore.addUsers).not.toHaveBeenCalled();
  });

  it('skips without adding when rate limited mid-fetch', async () => {
    topUsersApi.fetchTopUsers = vi
      .fn()
      .mockRejectedValue(new RateLimitError(123));

    await trackTopUsers.run(event);

    expect(profileStore.addUsers).not.toHaveBeenCalled();
  });

  it('rethrows other errors', async () => {
    topUsersApi.fetchTopUsers = vi.fn().mockRejectedValue(new Error('boom'));

    await expect(trackTopUsers.run(event)).rejects.toThrow('boom');
  });
});
