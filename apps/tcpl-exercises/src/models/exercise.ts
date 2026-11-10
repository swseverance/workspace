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
  /** Short name, shown in the page heading and title. */
  title: string;
  /** One or two plain-text sentences for the meta description. */
  summary: string;
  description: string;
  solution: string;
  tests: ExerciseTestCaseSource[];
};

export type ChapterSource = {
  number: number;
  exercises: ExerciseSource[];
};
