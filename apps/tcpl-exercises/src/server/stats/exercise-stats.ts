import { redisKey, redisProvider } from '@org/redis';
import * as logger from 'firebase-functions/logger';
import { ExerciseStats } from '../../shared/models';

/**
 * One hash holds every exercise's counts, two fields each
 * (`3-1:compiled`, `3-1:passed`). A page for one exercise reads its two
 * fields with one HMGET, and a page for all of them can read the whole
 * hash with one HGETALL, rather than a command or two per exercise.
 */
const statsKey = () => redisKey('tcpl:exercise-stats');

const compiledField = (exerciseId: string) => `${exerciseId}:compiled`;
const passedField = (exerciseId: string) => `${exerciseId}:passed`;

/** A count as Redis returns it: a number, or nothing if never set. */
const toCount = (value: unknown) => Number(value ?? 0);

/**
 * Everyone's submissions to an exercise so far, or null if Redis can't be
 * reached: the counts are an extra, so the page loads without them.
 */
export async function getExerciseStats(
  exerciseId: string,
): Promise<ExerciseStats | null> {
  try {
    const fields = await redisProvider
      .get()
      .hmget(statsKey(), compiledField(exerciseId), passedField(exerciseId));

    // hmget gives null when neither field exists.
    return {
      compiled: toCount(fields?.[compiledField(exerciseId)]),
      passed: toCount(fields?.[passedField(exerciseId)]),
    };
  } catch (err) {
    logger.warn('[exercise-stats] read failed', err);
    return null;
  }
}

/**
 * Counts a submission that compiled, and whether it passed every test.
 * Returns the counts including it, or null if Redis can't be reached: a
 * submission is graded and saved whether or not it's counted.
 *
 * One pipeline, so one round trip: HINCRBY returns the new count, and the
 * count that isn't changing is read alongside.
 */
export async function recordCompiledSubmission(
  exerciseId: string,
  passed: boolean,
): Promise<ExerciseStats | null> {
  try {
    const pipeline = redisProvider.get().pipeline();

    pipeline.hincrby(statsKey(), compiledField(exerciseId), 1);

    if (passed) {
      pipeline.hincrby(statsKey(), passedField(exerciseId), 1);
    } else {
      pipeline.hget(statsKey(), passedField(exerciseId));
    }

    const [compiledCount, passedCount] = await pipeline.exec();

    return { compiled: toCount(compiledCount), passed: toCount(passedCount) };
  } catch (err) {
    logger.warn('[exercise-stats] count failed', err);
    return null;
  }
}
