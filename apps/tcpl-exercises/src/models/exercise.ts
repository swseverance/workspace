export type ExerciseTestCaseSource = {
  id: string;
  stdin?: string;
  expectedStdout: string;
};

export type ExerciseSource = {
  id: string;
  chapter: number;
  number: number;
  suffix?: string;
  description: string;
  solution: string;
  tests: ExerciseTestCaseSource[];
};

export type ChapterSource = {
  number: number;
  exercises: ExerciseSource[];
};
