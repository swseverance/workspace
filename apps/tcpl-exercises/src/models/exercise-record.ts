import { TestStopReason } from '../shared/models';

export type ExerciseTestResultStatus = 'passed' | 'failed';

export type ExerciseRecordTestResult = {
  status: ExerciseTestResultStatus;
  actualStdout: string;
  actualStderr: string;
  stopReason: TestStopReason | null;
  exitCode: number | null;
};

export type ExerciseRecord = {
  id: string;
  code: string;
  tests: Record<string, ExerciseRecordTestResult>;
  compilationError: string;
  /** gcc's warnings from a submission that compiled. */
  compilerWarnings: string;
};
