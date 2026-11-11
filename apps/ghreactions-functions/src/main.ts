import { TRACKED_USERS, userForMinute } from '@org/ghreactions-github';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const refreshProfile = onSchedule(
  {
    schedule: 'every 1 minutes',
    region: 'us-east4',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (event) => {
    // The scheduled time, not the time the run started, so a late run still
    // refreshes the user it was meant for.
    const username = userForMinute(
      TRACKED_USERS,
      Date.parse(event.scheduleTime),
    );
    logger.info('refreshProfile', { username });
  },
);
