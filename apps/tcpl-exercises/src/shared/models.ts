/** Why the sandbox stopped a test run before it finished on its own. */
export type TestStopReason = 'timeout' | 'outputLimit';

export type ExerciseTestCaseStatus = 'passed' | 'failed' | 'indeterminate';

export type ExerciseTestCase = {
  id: string;
  stdin: string;
  expectedStdout: string;
  actualStdout: string;
  actualStderr: string;
  stopReason: TestStopReason | null;
  /** How the program exited; null when it never ran (compile failed). */
  exitCode: number | null;
  status: ExerciseTestCaseStatus;
};

export type ExerciseStatus = 'passed' | 'failed' | 'indeterminate' | 'pending';

/** One graded submission, as it was when it was graded. */
export type ExerciseSubmission = {
  id: string;
  /** ISO 8601. */
  created: string;
  status: ExerciseStatus;
  /** How many of the exercise's tests passed. */
  passed: number;
  total: number;
  code: string;
};

export type Exercise = {
  id: string;
  chapter: number;
  number: number;
  suffix?: string;
  /** Short name, shown in the page heading and title. */
  title: string;
  /** Plain text, for the meta description. */
  summary: string;
  /** HTML, converted from the exercise's markdown on the server. */
  description: string;
  code: string;
  solution: string;
  tests: ExerciseTestCase[];
  status: ExerciseStatus;
  compilationError: string;
  /** The user's most recent submissions, newest first. */
  submissions: ExerciseSubmission[];
};

export type Chapter = {
  number: number;
  exercises: Array<
    Pick<Exercise, 'id' | 'chapter' | 'number' | 'suffix' | 'status'>
  >;
};

export type ChaptersResponseBody = {
  chapters: Chapter[];
};

export type AnalyticsResponseBody = {
  /** Graded submissions, across every exercise and user. */
  submissions: number;
  /** Distinct users who have submitted at least once (approximate). */
  users: number;
};
