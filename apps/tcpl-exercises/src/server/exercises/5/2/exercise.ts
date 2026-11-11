import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 0.5, 1.5, ... 999.5: few enough digits that %g prints them in full.
const HALVES = Array.from({ length: 1000 }, (_, k) => `${k + 0.5}`);

export const exercise5_2: ExerciseSource = {
  id: '5-2',
  chapter: 5,
  number: 2,
  title: 'getfloat',
  summary:
    'Write getfloat, the floating-point analog of getint, and print each number it finds. K&R exercise 5-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'a336f405', expectedStdout: '' },
    // Numbers with fractions.
    { id: 'a4f17e6a', stdin: '1.5 2.25\n', expectedStdout: '1.5\n2.25\n' },
    // Whole numbers, signed and not.
    { id: '39da8c5b', stdin: '3 -4 +5\n', expectedStdout: '3\n-4\n5\n' },
    // A point with no digits before or after it.
    {
      id: 'c6014795',
      stdin: '.5 5. -.25\n',
      expectedStdout: '0.5\n5\n-0.25\n',
    },
    // Signs and points on their own aren't numbers.
    { id: '920dd081', stdin: '- 1.5 + . -.\n', expectedStdout: '1.5\n' },
    // Other characters around numbers are skipped.
    { id: 'a9e98d0c', stdin: 'x3.5y-2z\n', expectedStdout: '3.5\n-2\n' },
    // A second point starts a new number.
    { id: '90ce5d0c', stdin: '1.2.3\n', expectedStdout: '1.2\n0.3\n' },
    // %g switches to an exponent for large numbers.
    {
      id: '27737d58',
      stdin: '0.0001 123456789\n',
      expectedStdout: '0.0001\n1.23457e+08\n',
    },
    // Blanks, tabs and blank lines between numbers.
    {
      id: 'ce417044',
      stdin: '\t 10.5\n\n  20 \n',
      expectedStdout: '10.5\n20\n',
    },
    // A number right at the end of the input.
    { id: '7300a3cd', stdin: '1\n2.5', expectedStdout: '1\n2.5\n' },
    // 1000 numbers.
    {
      id: '99c592df',
      stdin: HALVES.join(' ') + '\n',
      expectedStdout: HALVES.map((x) => `${x}\n`).join(''),
    },
  ],
};
