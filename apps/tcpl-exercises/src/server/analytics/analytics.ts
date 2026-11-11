import { redisKey, serializeError } from '@org/server';
import * as logger from 'firebase-functions/logger';
import { AnalyticsResponseBody } from '../../shared/models';
import { redisProvider } from '../redis';

const submissionsKey = () => redisKey('analytics:submissions');
// A HyperLogLog: counts distinct users (~1% error) in a fixed ~12 KB
// without storing their ids.
const usersKey = () => redisKey('analytics:users');

/** Counts a graded submission. Never throws: analytics mustn't break a submit. */
export async function recordSubmission(uid: string): Promise<void> {
  try {
    const redis = redisProvider.get();
    await Promise.all([
      redis.incr(submissionsKey()),
      redis.pfadd(usersKey(), uid),
    ]);
  } catch (err) {
    logger.error('[analytics] record failed:', serializeError(err));
  }
}

export async function getStats(): Promise<AnalyticsResponseBody> {
  const redis = redisProvider.get();
  const [submissions, users] = await Promise.all([
    redis.get<number>(submissionsKey()),
    redis.pfcount(usersKey()),
  ]);

  return { submissions: submissions ?? 0, users };
}
