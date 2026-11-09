import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  ExerciseRecord,
  ExerciseRecordTestResult,
} from '../../models/exercise-record';

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

function exerciseRecordRef(uid: string, exerciseId: string) {
  return getFirestore().doc(`users/${uid}/exercises/${exerciseId}`);
}

function exerciseRecordsCollectionRef(uid: string) {
  return getFirestore().collection(`users/${uid}/exercises`);
}

export async function saveExerciseRecordCode(
  uid: string,
  exerciseId: string,
  code: string,
): Promise<ExerciseRecord> {
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

    return { id: exerciseId, code, tests: {}, compilationError: '' };
  }

  const update: UpdateExerciseRecord = {
    code,
    lastUpdated: FieldValue.serverTimestamp(),
  };
  await ref.update(update);

  const { tests, compilationError } = snapshot.data() as ReadExerciseRecord;

  return {
    id: exerciseId,
    code,
    tests,
    compilationError: compilationError ?? '',
  };
}

export async function saveExerciseRecordSubmission(
  uid: string,
  exerciseId: string,
  code: string,
  tests: Record<string, ExerciseRecordTestResult>,
  compilationError: string,
): Promise<ExerciseRecord> {
  const ref = exerciseRecordRef(uid, exerciseId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    const write: WriteExerciseRecord = {
      code,
      tests,
      compilationError,
      created: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp(),
    };
    await ref.set(write);
  } else {
    const update: UpdateExerciseRecordWithTests = {
      code,
      tests,
      compilationError,
      lastUpdated: FieldValue.serverTimestamp(),
    };
    await ref.update(update);
  }

  return { id: exerciseId, code, tests, compilationError };
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
