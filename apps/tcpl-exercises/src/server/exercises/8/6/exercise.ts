import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 2^62 and 2^62 + 1: times 8 and 4, they wrap around to 0 and 4 in 64 bits.
const WRAPS_TO_0 = '4611686018427387904 8';
const WRAPS_TO_4 = '4611686018427387905 4';

const SIZES = Array.from({ length: 500 }, (_, i) => i + 1);

export const exercise8_6: ExerciseSource = {
  id: '8-6',
  chapter: 8,
  number: 6,
  title: 'calloc',
  summary:
    'Write calloc, which allocates storage for n objects of a given size and initializes it to zero. K&R exercise 8-6, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '87d61c20', expectedStdout: '' },
    // Ten ints' worth.
    { id: 'b9da3b2d', stdin: '10 4\n', expectedStdout: '0\n' },
    // A single byte.
    { id: '073e8174', stdin: '1 1\n', expectedStdout: '0\n' },
    // The same size again, reusing the memory that was filled.
    {
      id: '75a19e30',
      stdin: '100 8\n100 8\n100 8\n',
      expectedStdout: '0\n0\n0\n',
    },
    // Different shapes of the same total.
    { id: '32f3f7ae', stdin: '64 1\n1 64\n8 8\n', expectedStdout: '0\n0\n0\n' },
    // A megabyte.
    { id: '87844eee', stdin: '1000 1000\n', expectedStdout: '0\n' },
    // n * size that wraps around to 0 or a small number.
    {
      id: '91bab630',
      stdin: `${WRAPS_TO_0}\n${WRAPS_TO_4}\n`,
      expectedStdout: 'NULL\nNULL\n',
    },
    // A size too big to allocate.
    {
      id: '45688147',
      stdin: '1 18446744073709551615\n',
      expectedStdout: 'NULL\n',
    },
    // A last line with no newline.
    { id: '89c4fbc6', stdin: '3 7', expectedStdout: '0\n' },
    // 500 sizes in a row.
    {
      id: 'c99a8668',
      stdin: SIZES.map((k) => `${k} 16\n`).join(''),
      expectedStdout: '0\n'.repeat(500),
    },
  ],
};
