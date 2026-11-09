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

export const STARTER_CODE = `#include <stdio.h>\n\nint main() {\n  return 0;\n}\n`;
