import { TestFile } from '../shared/models';

export type ExerciseTestCaseSource = {
  id: string;
  /** The program's name, its argv[0]; DEFAULT_PROGRAM if not given. */
  program?: string;
  /** Command-line arguments, after the program name. */
  args?: string[];
  /** Files in the directory the program runs in. */
  files?: TestFile[];
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
