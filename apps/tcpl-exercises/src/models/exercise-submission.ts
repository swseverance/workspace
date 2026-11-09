import { TestStopReason } from '../shared/models';

export type ExerciseTestResult = {
  id: string;
  passed: boolean;
  stdout: string;
  stderr: string;
  stopReason: TestStopReason | null;
  exitCode: number | null;
};
