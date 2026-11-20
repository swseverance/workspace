import type { ErrorResponseBody, SessionUser } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { ExerciseSource } from '../../models/exercise';
import { ExerciseRecordTestResult } from '../../models/exercise-record';
import {
  Chapter,
  ChaptersResponseBody,
  ExerciseStats,
  ExerciseStatus,
} from '../../shared/models';
import { CHAPTERS } from '../exercises';
import { computeExerciseStatus } from '../exercises/status';
import { getExerciseRecordTestsByExerciseId } from '../firestore/exercise-records';
import { getAllExerciseStats } from '../stats/exercise-stats';

function toChapters(
  getStatus: (exercise: ExerciseSource) => ExerciseStatus,
  getStats: (exercise: ExerciseSource) => ExerciseStats | null,
): Chapter[] {
  return CHAPTERS.map((chapter) => ({
    number: chapter.number,
    exercises: chapter.exercises.map((exercise) => ({
      id: exercise.id,
      chapter: exercise.chapter,
      number: exercise.number,
      suffix: exercise.suffix,
      title: exercise.title,
      status: getStatus(exercise),
      stats: getStats(exercise),
    })),
  }));
}

export async function getChaptersForUser(
  user: SessionUser | undefined,
): Promise<Chapter[]> {
  // Everyone's counts for every exercise come from one Redis command, so
  // a page listing them all (the stats page) costs no more than this.
  const [testsByExerciseId, stats]: [
    Record<string, Record<string, ExerciseRecordTestResult>>,
    Record<string, ExerciseStats> | null,
  ] = await Promise.all([
    user ? getExerciseRecordTestsByExerciseId(user.uid) : {},
    getAllExerciseStats(),
  ]);

  return toChapters(
    (exercise) =>
      computeExerciseStatus(
        exercise.tests,
        testsByExerciseId[exercise.id] ?? {},
      ),
    // Null only when the counts couldn't be loaded; an exercise nobody has
    // submitted counts as zero.
    (exercise) => stats && (stats[exercise.id] ?? { compiled: 0, passed: 0 }),
  );
}

export const getChaptersHandler: RequestHandler<
  Record<string, never>,
  ChaptersResponseBody | ErrorResponseBody
> = async (req, res) => {
  // Express 4 doesn't catch rejected promises from async handlers.
  try {
    res.json({ chapters: await getChaptersForUser(req.user) });
  } catch (err) {
    logger.error('[chapters] get failed', err);
    res.status(500).json({ message: 'Failed to load chapters' });
  }
};
