import {
  Profile,
  profileApi,
  rateLimit,
  RateLimitError,
} from '@org/ghreactions-github';
import * as logger from 'firebase-functions/logger';

export type ProfileWriter = (profile: Profile) => Promise<void>;

/**
 * Fetches one user's profile and writes it. Skips the user while GitHub calls
 * are paused (shared with the site via Redis); they come up again next cycle.
 */
export async function refreshUser(
  username: string,
  write: ProfileWriter,
): Promise<void> {
  try {
    await rateLimit.checkRateLimit();
    const profile = await profileApi.fetchProfile(username);
    await write(profile);
    logger.info('refreshProfile', {
      username,
      status: profile.status,
      ...profile.counts,
    });
  } catch (err) {
    if (!(err instanceof RateLimitError)) throw err;
    logger.warn('refreshProfile skipped: GitHub rate limited', {
      username,
      retryAt: err.retryAt,
    });
  }
}
