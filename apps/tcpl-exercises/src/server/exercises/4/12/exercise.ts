import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Every integer from -500 to 500, one per line.
const RANGE = Array.from({ length: 1001 }, (_, i) => `${i - 500}\n`).join('');

export const exercise4_12: ExerciseSource = {
  id: '4-12',
  chapter: 4,
  number: 12,
  title: 'Recursive itoa',
  summary:
    'Convert an integer to a string with a recursive routine, adapting the ideas of printd. K&R exercise 4-12, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '270b8a64', expectedStdout: '' },
    // Zero still needs one digit.
    { id: '19222d45', stdin: '0\n', expectedStdout: '0\n' },
    // Single digits.
    { id: 'cdd1d051', stdin: '7\n-7\n', expectedStdout: '7\n-7\n' },
    // Several digits.
    { id: '6ddb1219', stdin: '123\n-4567\n', expectedStdout: '123\n-4567\n' },
    // Zeros inside and at the end.
    {
      id: '3dc61e94',
      stdin: '10\n1005\n-1000\n1000000000\n',
      expectedStdout: '10\n1005\n-1000\n1000000000\n',
    },
    // The largest int.
    { id: '8f282901', stdin: '2147483647\n', expectedStdout: '2147483647\n' },
    // The largest negative int.
    { id: '72aae8ff', stdin: '-2147483648\n', expectedStdout: '-2147483648\n' },
    // A last line with no newline.
    { id: 'ed0ba2fe', stdin: '1\n-25', expectedStdout: '1\n-25\n' },
    // Every integer from -500 to 500.
    { id: '1ca764f7', stdin: RANGE, expectedStdout: RANGE },
  ],
};
