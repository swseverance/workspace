import { ExerciseTestCaseSource } from '../../models/exercise';
import { ExerciseRecordTestResult } from '../../models/exercise-record';
import { ExerciseStatus } from '../../shared/models';

export function computeExerciseStatus(
  tests: ExerciseTestCaseSource[],
  results: Record<string, ExerciseRecordTestResult>,
): ExerciseStatus {
  const statuses = tests.map((test): ExerciseStatus => {
    const result: ExerciseRecordTestResult | undefined = results[test.id];
    return result ? result.status : 'indeterminate';
  });

  if (statuses.some((status) => status === 'indeterminate')) {
    return 'indeterminate';
  }

  return statuses.some((status) => status === 'failed') ? 'failed' : 'passed';
}
