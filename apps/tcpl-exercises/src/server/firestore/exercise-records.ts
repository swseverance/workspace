import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  ExerciseRecord,
  ExerciseRecordTestResult,
} from '../../models/exercise-record';
import { ExerciseStatus, ExerciseSubmission } from '../../shared/models';

type WriteExerciseRecord = {
  code: string;
  tests: Record<string, ExerciseRecordTestResult>;
  compilationError: string;
  created: FieldValue;
  lastUpdated: FieldValue;
};

type UpdateExerciseRecord = {
  code: string;
  lastUpdated: FieldValue;
};

type UpdateExerciseRecordWithTests = {
  code: string;
  tests: Record<string, ExerciseRecordTestResult>;
  compilationError: string;
  lastUpdated: FieldValue;
};

type ReadExerciseRecord = {
  code: string;
  tests: Record<string, ExerciseRecordTestResult>;
  compilationError: string | undefined;
  created: Timestamp;
  lastUpdated: Timestamp;
};

type SubmissionDoc = {
  code: string;
  status: ExerciseStatus;
  passed: number;
  total: number;
  created: Timestamp;
};

/** How many submissions are sent with an exercise. */
export const SUBMISSION_HISTORY_LIMIT = 20;

/**
 * How many bytes of each test's stdout and stderr are saved. The sandbox
 * allows 64 KB of each per test, and every test's output goes in the one
 * exercise record, which Firestore caps at 1 MiB: a program stuck printing in
 * a loop would otherwise make the write fail. This is plenty for the diff
 * view, and leaves room for about 50 tests. Pass/fail is decided before
 * truncating.
 */
export const SAVED_OUTPUT_LIMIT_BYTES = 8 * 1024;

/** Compiler errors get more room: there's only one of them. */
export const SAVED_COMPILATION_ERROR_LIMIT_BYTES = 32 * 1024;

const encoder = new TextEncoder();

/**
 * Cuts `text` to at most `limitBytes` of UTF-8, saying how much was left
 * out. Counted in bytes because that's what Firestore counts, and garbage
 * output decodes to U+FFFD, three bytes each.
 */
export function truncateOutput(text: string, limitBytes: number): string {
  // encodeInto stops before a character that doesn't fit, so it never
  // splits one.
  const { read, written } = encoder.encodeInto(
    text,
    new Uint8Array(limitBytes),
  );

  if (read === text.length) {
    return text;
  }

  const omitted = encoder.encode(text).length - written;

  return `${text.slice(0, read)}\n… ${omitted.toLocaleString('en-US')} more bytes not saved`;
}

function truncateTests(
  tests: Record<string, ExerciseRecordTestResult>,
): Record<string, ExerciseRecordTestResult> {
  return Object.fromEntries(
    Object.entries(tests).map(([id, test]) => [
      id,
      {
        ...test,
        actualStdout: truncateOutput(
          test.actualStdout,
          SAVED_OUTPUT_LIMIT_BYTES,
        ),
        actualStderr: truncateOutput(
          test.actualStderr,
          SAVED_OUTPUT_LIMIT_BYTES,
        ),
      },
    ]),
  );
}

function exerciseRecordRef(uid: string, exerciseId: string) {
  return getFirestore().doc(`users/${uid}/exercises/${exerciseId}`);
}

function submissionsCollectionRef(uid: string, exerciseId: string) {
  return exerciseRecordRef(uid, exerciseId).collection('submissions');
}

function toSubmission(id: string, doc: SubmissionDoc): ExerciseSubmission {
  return {
    id,
    created: doc.created.toDate().toISOString(),
    status: doc.status,
    passed: doc.passed,
    total: doc.total,
    code: doc.code,
  };
}

function exerciseRecordsCollectionRef(uid: string) {
  return getFirestore().collection(`users/${uid}/exercises`);
}

export async function saveExerciseRecordCode(
  uid: string,
  exerciseId: string,
  code: string,
): Promise<void> {
  const ref = exerciseRecordRef(uid, exerciseId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    const write: WriteExerciseRecord = {
      code,
      tests: {},
      compilationError: '',
      created: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp(),
    };
    await ref.set(write);
    return;
  }

  const update: UpdateExerciseRecord = {
    code,
    lastUpdated: FieldValue.serverTimestamp(),
  };
  await ref.update(update);
}

/**
 * Saves a graded submission as the exercise's current state and appends it
 * to the submission history, in one atomic write. Long outputs are truncated
 * (see SAVED_OUTPUT_LIMIT_BYTES), and the returned record has them truncated too,
 * so the response matches what a reload would show.
 */
export async function saveExerciseRecordSubmission(
  uid: string,
  exerciseId: string,
  code: string,
  fullTests: Record<string, ExerciseRecordTestResult>,
  fullCompilationError: string,
  summary: Pick<ExerciseSubmission, 'status' | 'passed' | 'total'>,
): Promise<{ record: ExerciseRecord; submission: ExerciseSubmission }> {
  const tests = truncateTests(fullTests);
  const compilationError = truncateOutput(
    fullCompilationError,
    SAVED_COMPILATION_ERROR_LIMIT_BYTES,
  );
  const ref = exerciseRecordRef(uid, exerciseId);
  const snapshot = await ref.get();
  const batch = getFirestore().batch();

  if (!snapshot.exists) {
    const write: WriteExerciseRecord = {
      code,
      tests,
      compilationError,
      created: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp(),
    };
    batch.set(ref, write);
  } else {
    const update: UpdateExerciseRecordWithTests = {
      code,
      tests,
      compilationError,
      lastUpdated: FieldValue.serverTimestamp(),
    };
    batch.update(ref, update);
  }

  // A concrete time rather than serverTimestamp(), so the response can
  // include it without reading the doc back.
  const submissionRef = submissionsCollectionRef(uid, exerciseId).doc();
  const submissionDoc: SubmissionDoc = {
    code,
    ...summary,
    created: Timestamp.now(),
  };
  batch.create(submissionRef, submissionDoc);

  await batch.commit();

  return {
    record: { id: exerciseId, code, tests, compilationError },
    submission: toSubmission(submissionRef.id, submissionDoc),
  };
}

/** The user's most recent submissions for an exercise, newest first. */
export async function getExerciseSubmissions(
  uid: string,
  exerciseId: string,
): Promise<ExerciseSubmission[]> {
  const snapshot = await submissionsCollectionRef(uid, exerciseId)
    .orderBy('created', 'desc')
    .limit(SUBMISSION_HISTORY_LIMIT)
    .get();

  return snapshot.docs.map((doc) =>
    toSubmission(doc.id, doc.data() as SubmissionDoc),
  );
}

export async function getExerciseRecord(
  uid: string,
  exerciseId: string,
): Promise<ExerciseRecord | undefined> {
  const snapshot = await exerciseRecordRef(uid, exerciseId).get();
  const data = snapshot.data() as ReadExerciseRecord | undefined;

  if (!data) {
    return undefined;
  }

  return {
    id: exerciseId,
    code: data.code,
    tests: data.tests,
    compilationError: data.compilationError ?? '',
  };
}

export async function getExerciseRecordTestsByExerciseId(
  uid: string,
): Promise<Record<string, Record<string, ExerciseRecordTestResult>>> {
  const snapshot = await exerciseRecordsCollectionRef(uid).get();

  return Object.fromEntries(
    snapshot.docs.map((doc) => [
      doc.id,
      (doc.data() as ReadExerciseRecord).tests,
    ]),
  );
}
