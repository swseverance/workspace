export type ExerciseTestCaseStatus = 'passed' | 'failed' | 'indeterminate';

export type ExerciseTestCase = {
  id: string;
  stdin: string;
  expectedStdout: string;
  actualStdout: string;
  status: ExerciseTestCaseStatus;
};

export type ExerciseStatus = 'passed' | 'failed' | 'indeterminate' | 'pending';

export type Exercise = {
  id: string;
  chapter: number;
  number: number;
  suffix?: string;
  /** HTML, converted from the exercise's markdown on the server. */
  description: string;
  code: string;
  solution: string;
  tests: ExerciseTestCase[];
  status: ExerciseStatus;
  compilationError: string;
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
