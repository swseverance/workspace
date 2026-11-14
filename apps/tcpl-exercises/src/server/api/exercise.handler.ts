import type { SessionUser } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { ExerciseSource } from '../../models/exercise';
import {
  ExerciseRecord,
  ExerciseRecordTestResult,
} from '../../models/exercise-record';
import {
  DEFAULT_PROGRAM,
  Exercise,
  ExerciseSubmission,
  ExerciseTestCase,
} from '../../shared/models';
import { computeExerciseStatus } from '../exercises/status';
import {
  getExerciseRecord,
  getExerciseSubmissions,
  saveExerciseRecordSubmission,
  SUBMISSION_HISTORY_LIMIT,
  truncateGraded,
} from '../firestore/exercise-records';
import { gradeSubmission } from '../sandbox/run-c';

const STARTER_CODE = `#include <stdio.h>\n\nint main() {\n  return 0;\n}\n`;

type ExerciseCodeRequestBody = {
  code: string;
};

function toExercise(
  exercise: ExerciseSource,
  {
    code,
    tests,
    compilationError,
    compilerWarnings,
  }: Omit<ExerciseRecord, 'id'>,
  submissions: ExerciseSubmission[],
): Exercise {
  const { id, chapter, number, suffix, title, summary, description } = exercise;

  // The page shows one block of code: the later solution under the first.
  const solution = exercise.laterSolution
    ? `${exercise.solution}\n${exercise.laterSolution}`
    : exercise.solution;

  const finalTests: ExerciseTestCase[] = exercise.tests.map(
    ({
      id: testId,
      program,
      args,
      files,
      stdin,
      expectedStdout,
    }): ExerciseTestCase => {
      const result: ExerciseRecordTestResult | undefined = tests[testId];

      if (!result) {
        return {
          id: testId,
          program: program ?? DEFAULT_PROGRAM,
          args: args ?? [],
          files: files ?? [],
          stdin: stdin ?? '',
          expectedStdout,
          actualStdout: '',
          actualStderr: '',
          stopReason: null,
          exitCode: null,
          status: 'indeterminate',
        };
      }

      return {
        id: testId,
        program: program ?? DEFAULT_PROGRAM,
        args: args ?? [],
        files: files ?? [],
        stdin: stdin ?? '',
        expectedStdout,
        actualStdout: result.actualStdout,
        actualStderr: result.actualStderr,
        stopReason: result.stopReason,
        exitCode: result.exitCode,
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
    title,
    summary,
    description,
    code,
    solution,
    tests: finalTests,
    status,
    compilationError,
    compilerWarnings,
    submissions,
  };
}

const MAX_CODE_LENGTH = 20_000;

export async function getExerciseForUser(
  exercise: ExerciseSource,
  user: SessionUser | undefined,
): Promise<Exercise> {
  const [record, submissions] = user
    ? await Promise.all([
        getExerciseRecord(user.uid, exercise.id),
        getExerciseSubmissions(user.uid, exercise.id),
      ])
    : [undefined, []];

  return toExercise(
    exercise,
    record ?? {
      code: STARTER_CODE,
      tests: {},
      compilationError: '',
      compilerWarnings: '',
    },
    submissions,
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
    const uid = req.user?.uid;
    const exercise = req.exercise!;

    // Load the earlier submissions while the code is being graded.
    const [
      { compilationError, compilerWarnings, results },
      previousSubmissions,
    ] = await Promise.all([
      gradeSubmission(code, exercise.tests),
      uid ? getExerciseSubmissions(uid, exercise.id) : [],
    ]);

    const tests: Record<string, ExerciseRecordTestResult> = Object.fromEntries(
      results.map((result) => [
        result.id,
        {
          status: result.passed ? 'passed' : 'failed',
          actualStdout: result.stdout,
          actualStderr: result.stderr,
          stopReason: result.stopReason,
          exitCode: result.exitCode,
        },
      ]),
    );

    // Signed out: graded, but nothing is saved, so there's no history.
    if (!uid) {
      res.json(
        toExercise(
          exercise,
          {
            code,
            ...truncateGraded({ tests, compilationError, compilerWarnings }),
          },
          [],
        ),
      );
      return;
    }

    const { record, submission } = await saveExerciseRecordSubmission(
      uid,
      exercise.id,
      code,
      { tests, compilationError, compilerWarnings },
      {
        status: computeExerciseStatus(exercise.tests, tests),
        passed: exercise.tests.filter((t) => tests[t.id]?.status === 'passed')
          .length,
        total: exercise.tests.length,
      },
    );
    res.json(
      toExercise(
        exercise,
        record,
        [submission, ...previousSubmissions].slice(0, SUBMISSION_HISTORY_LIMIT),
      ),
    );
  } catch (err) {
    logger.error('[exercise] submit failed', err);
    res.status(500).json({ message: 'Failed to submit exercise' });
  }
};
