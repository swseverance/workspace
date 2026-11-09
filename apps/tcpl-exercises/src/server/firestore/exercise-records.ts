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
 * to the submission history, in one atomic write.
 */
export async function saveExerciseRecordSubmission(
  uid: string,
  exerciseId: string,
  code: string,
  tests: Record<string, ExerciseRecordTestResult>,
  compilationError: string,
  summary: Pick<ExerciseSubmission, 'status' | 'passed' | 'total'>,
): Promise<{ record: ExerciseRecord; submission: ExerciseSubmission }> {
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
