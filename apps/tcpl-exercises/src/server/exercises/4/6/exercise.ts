import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Set A to 1, B to 2, ... Z to 26, then add them all up.
const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);
const ALL_VARIABLES_IN =
  LETTERS.map((letter, i) => `${i + 1} ${letter} =\n`).join('') +
  LETTERS[0] +
  LETTERS.slice(1)
    .map((letter) => ` ${letter} +`)
    .join('') +
  '\n';
const ALL_VARIABLES_OUT =
  LETTERS.map((_, i) => `\t${i + 1}\n`).join('') + '\t351\n';

export const exercise4_6: ExerciseSource = {
  id: '4-6',
  chapter: 4,
  number: 6,
  title: 'Calculator: variables',
  summary:
    'Add 26 single-letter variables to the reverse Polish calculator, and one for the last value printed. K&R exercise 4-6, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: 'df6464de', expectedStdout: '' },
    // Setting a variable leaves its value on the stack.
    { id: 'cf7759fa', stdin: '3 A =\n', expectedStdout: '\t3\n' },
    // Using a variable.
    { id: 'dcaf74e0', stdin: '3 A =\nA A *\n', expectedStdout: '\t3\n\t9\n' },
    // A variable starts at 0.
    { id: '09096036', stdin: 'B 1 +\n', expectedStdout: '\t1\n' },
    // Two variables.
    {
      id: 'ae0e71aa',
      stdin: '2 X =\n5 Y =\nX Y -\n',
      expectedStdout: '\t2\n\t5\n\t-3\n',
    },
    // Setting a variable again.
    {
      id: 'a3acd41a',
      stdin: '1 A =\n2 A =\nA\n',
      expectedStdout: '\t1\n\t2\n\t2\n',
    },
    // Carrying on after = on the same line.
    { id: '0e9146cd', stdin: '4 C = 1 +\nC\n', expectedStdout: '\t5\n\t4\n' },
    // A and Z, the first and last.
    {
      id: 'cb20cf2a',
      stdin: '1 A = 26 Z =\nA Z +\n',
      expectedStdout: '\t26\n\t27\n',
    },
    // v starts at 0.
    { id: 'a4d3a644', stdin: 'v 1 +\n', expectedStdout: '\t1\n' },
    // v is the value just printed.
    { id: '94f7c156', stdin: '2 3 +\nv 10 *\n', expectedStdout: '\t5\n\t50\n' },
    // v changes with each value printed.
    {
      id: 'ce4b6e9e',
      stdin: '1\n2\nv v +\n',
      expectedStdout: '\t1\n\t2\n\t4\n',
    },
    // A last line with no newline prints nothing.
    { id: '228943fe', stdin: '5 A =\nA', expectedStdout: '\t5\n' },
    // All 26 variables.
    {
      id: '071cf2c9',
      stdin: ALL_VARIABLES_IN,
      expectedStdout: ALL_VARIABLES_OUT,
    },
  ],
};
