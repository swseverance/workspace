import {
  profileApi,
  rateLimit,
  RateLimitError,
  topUsersApi,
} from '@org/ghreactions-github';
import { initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import { onSchedule, ScheduleOptions } from 'firebase-functions/v2/scheduler';
import { profileStore } from './profiles';

initializeApp({ projectId: process.env['PROJECT_ID'] });

// The same Secret Manager entries the ghreactions App Hosting backend uses.
const githubToken = defineSecret('GHREACTIONS_TOKEN');
const redisToken = defineSecret('UPSTASH_REDIS_REST_TOKEN');

const common: Omit<ScheduleOptions, 'schedule'> = {
  region: 'us-east4',
  memory: '256MiB',
  secrets: [githubToken, redisToken],
};

/**
 * Refreshes one profile a minute, the one attempted longest ago: up to 1,440
 * users a day, so each refreshes at least daily up to that many. Skips the
 * run while GitHub calls are paused (shared with the site via Redis); the
 * same user comes up again next minute.
 */
export const refreshProfile = onSchedule(
  { ...common, schedule: 'every 1 minutes', timeoutSeconds: 60 },
  async () => {
    const username = await profileStore.findStalest();
    if (!username) {
      logger.info('refreshProfile: no profiles yet; trackTopUsers adds them');
      return;
    }

    try {
      await rateLimit.checkRateLimit();
      const profile = await profileApi.fetchProfile(username);
      await profileStore.write(profile);
      logger.info('refreshProfile', {
        username,
        status: profile.status,
        ...profile.counts,
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        logger.warn('refreshProfile skipped: GitHub rate limited', {
          username,
          retryAt: err.retryAt,
        });
        return;
      }
      // Send the user to the back of the queue, so a refresh that keeps
      // failing doesn't stop everyone else's.
      await profileStore.touch(username);
      throw err;
    }
  },
);

/**
 * Adds GitHub's most-followed users to the profiles refreshProfile works
 * through, once a day. Never removes anyone, so a user who drops out of the
 * top list keeps their page. Skips the day while GitHub calls are paused
 * (shared with the site via Redis).
 */
export const trackTopUsers = onSchedule(
  {
    ...common,
    schedule: 'every day 06:00',
    timeZone: 'UTC',
    timeoutSeconds: 300,
  },
  async () => {
    try {
      await rateLimit.checkRateLimit();
      const usernames = await topUsersApi.fetchTopUsers();
      const added = await profileStore.addUsers(usernames);
      logger.info('trackTopUsers', { found: usernames.length, added });
    } catch (err) {
      if (!(err instanceof RateLimitError)) throw err;
      logger.warn('trackTopUsers skipped: GitHub rate limited', {
        retryAt: err.retryAt,
      });
    }
  },
);
