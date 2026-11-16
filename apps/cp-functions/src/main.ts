import { setGlobalOptions } from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/scheduler';
import {
  getUserInfo as getAtCoderUserInfo,
  getUpcomingContests as getUpcomingAtCoderContests,
} from './atcoder';
import { getUpcomingContests, getUserInfo } from './codeforces';
import { buildAtCoderEmailHtml, buildEmailHtml, sendEmail } from './email';

setGlobalOptions({ maxInstances: 1 });

const CODEFORCES_HANDLE = 'so_crates_83';
const ATCODER_HANDLE = 'swseverance';

// Where both functions are already deployed; stated so a redeploy can never
// move them.
const REGION = 'us-central1';

const gmailUser = defineSecret('GMAIL_USER');
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');

export const dailyCodeforcesEmail = onSchedule(
  {
    schedule: '0 8 * * *',
    timeZone: 'America/New_York',
    region: REGION,
    secrets: [gmailUser, gmailAppPassword],
  },
  async () => {
    const [user, contests] = await Promise.all([
      getUserInfo(CODEFORCES_HANDLE),
      getUpcomingContests(),
    ]);

    const html = buildEmailHtml(user, contests);

    await sendEmail({
      gmailUser: gmailUser.value(),
      gmailAppPassword: gmailAppPassword.value(),
      // Sent to the same account that sends it.
      toEmail: gmailUser.value(),
      subject: `Codeforces Daily Update - Rating: ${user.rating}`,
      html,
    });

    logger.info('Sent daily Codeforces email', {
      handle: CODEFORCES_HANDLE,
      rating: user.rating,
      upcomingContestCount: contests.length,
    });
  },
);

export const dailyAtCoderEmail = onSchedule(
  {
    schedule: '0 8 * * *',
    timeZone: 'America/New_York',
    region: REGION,
    secrets: [gmailUser, gmailAppPassword],
  },
  async () => {
    const [user, contests] = await Promise.all([
      getAtCoderUserInfo(ATCODER_HANDLE),
      getUpcomingAtCoderContests(),
    ]);

    const html = buildAtCoderEmailHtml(user, contests);

    await sendEmail({
      gmailUser: gmailUser.value(),
      gmailAppPassword: gmailAppPassword.value(),
      // Sent to the same account that sends it.
      toEmail: gmailUser.value(),
      subject: `AtCoder Daily Update - Rating: ${user.rating ?? 'Unrated'}`,
      html,
    });

    logger.info('Sent daily AtCoder email', {
      handle: ATCODER_HANDLE,
      rating: user.rating,
      upcomingContestCount: contests.length,
    });
  },
);
