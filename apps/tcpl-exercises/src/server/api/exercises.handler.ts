import type { ErrorResponseBody, SessionUser } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { ExerciseSource } from '../../models/exercise';
import { ExerciseRecordTestResult } from '../../models/exercise-record';
import {
  Chapter,
  ExercisesResponseBody,
  ExerciseStatus,
} from '../../shared/models';
import { CHAPTERS } from '../exercises';
import { computeExerciseStatus } from '../exercises/status';
import { getExerciseRecordTestsByExerciseId } from '../firestore/exercise-records';

function toChapters(
  getStatus: (exercise: ExerciseSource) => ExerciseStatus,
): Chapter[] {
  return CHAPTERS.map((chapter) => ({
    number: chapter.number,
    exercises: chapter.exercises.map((exercise) => ({
      id: exercise.id,
      chapter: exercise.chapter,
      number: exercise.number,
      suffix: exercise.suffix,
      status: getStatus(exercise),
    })),
  }));
}

export async function getChaptersForUser(
  user: SessionUser | undefined,
): Promise<Chapter[]> {
  const testsByExerciseId: Record<
    string,
    Record<string, ExerciseRecordTestResult>
  > = user ? await getExerciseRecordTestsByExerciseId(user.uid) : {};

  return toChapters((exercise) =>
    computeExerciseStatus(exercise.tests, testsByExerciseId[exercise.id] ?? {}),
  );
}

export const getExercisesHandler: RequestHandler<
  Record<string, never>,
  ExercisesResponseBody | ErrorResponseBody
> = async (req, res) => {
  // Express 4 doesn't catch rejected promises from async handlers.
  try {
    res.json({ chapters: await getChaptersForUser(req.user) });
  } catch (err) {
    logger.error('[exercises] get failed', err);
    res.status(500).json({ message: 'Failed to load exercises' });
  }
};
