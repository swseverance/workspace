import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const PAIRS = Array.from({ length: 500 }, (_, i) => i + 1);

export const exercise5_1: ExerciseSource = {
  id: '5-1',
  chapter: 5,
  number: 1,
  title: 'getint and a sign on its own',
  summary:
    'Fix getint so a + or - not followed by a digit is pushed back instead of read as zero. K&R exercise 5-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'bce42672', expectedStdout: '' },
    // Plain integers.
    { id: '26ce28db', stdin: '1 2 3\n', expectedStdout: '1\n2\n3\n' },
    // Signed integers.
    { id: '62742cea', stdin: '-5 +7\n', expectedStdout: '-5\n7\n' },
    // A sign followed by a blank isn't zero.
    { id: '6043855b', stdin: '- 5\n+ x 3\n', expectedStdout: '5\n3\n' },
    // Signs on their own.
    { id: 'aa5896e2', stdin: '-\n+\n', expectedStdout: '' },
    // A sign followed by another sign.
    { id: 'cfc0d481', stdin: '--5 +-6\n', expectedStdout: '-5\n-6\n' },
    // Other characters around integers are skipped.
    { id: '35974683', stdin: 'a1b22c\n', expectedStdout: '1\n22\n' },
    // Blanks, tabs and blank lines between integers.
    { id: 'df1e72d6', stdin: '\t 10\n\n  20 \n', expectedStdout: '10\n20\n' },
    // Zero, with and without a sign.
    { id: '5b1e4db1', stdin: '0 -0\n', expectedStdout: '0\n0\n' },
    // An integer right at the end of the input.
    { id: '83d66957', stdin: '4 2', expectedStdout: '4\n2\n' },
    // A sign right at the end of the input.
    { id: 'eb1d5899', stdin: '7 -', expectedStdout: '7\n' },
    // 500 lines, each with a sign on its own between two integers.
    {
      id: '02edd205',
      stdin: PAIRS.map((k) => `${k} - -${k}\n`).join(''),
      expectedStdout: PAIRS.map((k) => `${k}\n-${k}\n`).join(''),
    },
  ],
};
