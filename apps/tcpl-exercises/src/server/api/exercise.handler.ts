import type { SessionUser } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { ExerciseSource } from '../../models/exercise';
import { ExerciseRecordTestResult } from '../../models/exercise-record';
import { Exercise, ExerciseTestCase } from '../../shared/models';
import { computeExerciseStatus } from '../exercises/status';
import {
  getExerciseRecord,
  saveExerciseRecordCode,
  saveExerciseRecordSubmission,
} from '../firestore/exercise-records';
import { gradeSubmission } from '../sandbox/run-c';

const STARTER_CODE = `#include <stdio.h>\n\nint main() {\n  return 0;\n}\n`;

type ExerciseCodeRequestBody = {
  code: string;
};

function toExercise(
  exercise: ExerciseSource,
  code: string,
  tests: Record<string, ExerciseRecordTestResult>,
  compilationError: string,
): Exercise {
  const { id, chapter, number, suffix, description, solution } = exercise;

  const finalTests: ExerciseTestCase[] = exercise.tests.map(
    ({ id: testId, stdin, expectedStdout }): ExerciseTestCase => {
      const result: ExerciseRecordTestResult | undefined = tests[testId];

      if (!result) {
        return {
          id: testId,
          stdin: stdin ?? '',
          expectedStdout,
          actualStdout: '',
          status: 'indeterminate',
        };
      }

      return {
        id: testId,
        stdin: stdin ?? '',
        expectedStdout,
        actualStdout: result.actualStdout,
        status: result.status,
      };
    },
  );

  const status = computeExerciseStatus(exercise.tests, tests);

  return {
    id,
    chapter,
    number,
    suffix,
    description,
    code,
    solution,
    tests: finalTests,
    status,
    compilationError,
  };
}

const MAX_CODE_LENGTH = 20_000;

export const saveExerciseCodeHandler: RequestHandler<
  { id: string },
  unknown,
  ExerciseCodeRequestBody
> = async (req, res) => {
  const code = req.body.code === null ? '' : req.body.code;

  if (typeof code !== 'string') {
    res.status(400).json({ message: 'code is required' });
    return;
  }

  if (code.length > MAX_CODE_LENGTH) {
    res
      .status(400)
      .json({ message: `code must be at most ${MAX_CODE_LENGTH} characters` });
    return;
  }

  try {
    const record = await saveExerciseRecordCode(
      req.user!.uid,
      req.params.id,
      code,
    );
    res.json(
      toExercise(
        req.exercise!,
        record.code,
        record.tests,
        record.compilationError,
      ),
    );
  } catch (err) {
    logger.error('[exercise] save code failed', err);
    res.status(500).json({ message: 'Failed to save code' });
  }
};

export async function getExerciseForUser(
  exercise: ExerciseSource,
  user: SessionUser | undefined,
): Promise<Exercise> {
  const record = user ? await getExerciseRecord(user.uid, exercise.id) : null;

  return toExercise(
    exercise,
    record?.code ?? STARTER_CODE,
    record?.tests ?? {},
    record?.compilationError ?? '',
  );
}

export const getExerciseHandler: RequestHandler<{ id: string }> = async (
  req,
  res,
) => {
  // Express 4 doesn't catch rejected promises from async handlers.
  try {
    res.json(await getExerciseForUser(req.exercise!, req.user));
  } catch (err) {
    logger.error('[exercise] get failed', err);
    res.status(500).json({ message: 'Failed to load exercise' });
  }
};

export const submitExerciseHandler: RequestHandler<
  { id: string },
  unknown,
  ExerciseCodeRequestBody
> = async (req, res) => {
  const code = req.body.code === null ? '' : req.body.code;

  if (typeof code !== 'string') {
    res.status(400).json({ message: 'code is required' });
    return;
  }

  if (code.length > MAX_CODE_LENGTH) {
    res
      .status(400)
      .json({ message: `code must be at most ${MAX_CODE_LENGTH} characters` });
    return;
  }

  try {
    const { compile, results } = await gradeSubmission(
      code,
      req.exercise!.tests,
    );
    const compileFailed = compile.timedOut || compile.exitCode !== 0;
    const compilationError = compileFailed ? compile.stderr : '';

    const tests: Record<string, ExerciseRecordTestResult> = Object.fromEntries(
      results.map((result) => [
        result.id,
        {
          status: result.passed ? 'passed' : 'failed',
          actualStdout: result.stdout,
        },
      ]),
    );

    const record = await saveExerciseRecordSubmission(
      req.user!.uid,
      req.params.id,
      code,
      tests,
      compilationError,
    );
    res.json(
      toExercise(
        req.exercise!,
        record.code,
        record.tests,
        record.compilationError,
      ),
    );
  } catch (err) {
    logger.error('[exercise] submit failed', err);
    res.status(500).json({ message: 'Failed to submit exercise' });
  }
};
