export type ExerciseTestResultStatus = 'passed' | 'failed';

export type ExerciseRecordTestResult = {
  status: ExerciseTestResultStatus;
  actualStdout: string;
};

export type ExerciseRecord = {
  id: string;
  code: string;
  tests: Record<string, ExerciseRecordTestResult>;
  compilationError: string;
};
