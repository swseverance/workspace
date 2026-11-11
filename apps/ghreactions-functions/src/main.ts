import { TRACKED_USERS, userForMinute } from '@org/ghreactions-github';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { refreshUser } from './refresh';

initializeApp({ projectId: process.env['PROJECT_ID'] });

// The same Secret Manager entries the ghreactions App Hosting backend uses.
const githubToken = defineSecret('GHREACTIONS_TOKEN');
const redisToken = defineSecret('UPSTASH_REDIS_REST_TOKEN');

export const refreshProfile = onSchedule(
  {
    schedule: 'every 1 minutes',
    region: 'us-east4',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: [githubToken, redisToken],
  },
  async (event) => {
    // The scheduled time, not the time the run started, so a late run still
    // refreshes the user it was meant for.
    const username = userForMinute(
      TRACKED_USERS,
      Date.parse(event.scheduleTime),
    );
    await refreshUser(username, async (profile) => {
      await getFirestore()
        .doc(`profiles/${username.toLowerCase()}`)
        .set(profile);
    });
  },
);
