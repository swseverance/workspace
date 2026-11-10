import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Values around each base's first few powers, plus some large ones, in
// every base from 2 to 36. JavaScript's toString(b) uses the same digits.
const STRESS = Array.from({ length: 35 }, (_, i) => i + 2).flatMap((b) =>
  [b - 1, b, b * b - 1, b * b, -b, 1_000_000, -1_000_000, 2_147_483_647].map(
    (n) => ({ input: `${n} ${b}\n`, output: `${n.toString(b)}\n` }),
  ),
);

export const exercise3_5: ExerciseSource = {
  id: '3-5',
  chapter: 3,
  number: 5,
  title: 'Integer to a string in any base',
  summary:
    'Convert an integer to a string in any base from 2 to 36, such as binary or hexadecimal. K&R exercise 3-5, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '83ad3643', expectedStdout: '' },
    // Hexadecimal.
    {
      id: '8676c8e4',
      stdin: '255 16\n4096 16\n48879 16\n',
      expectedStdout: 'ff\n1000\nbeef\n',
    },
    // Binary.
    {
      id: '86f67352',
      stdin: '1 2\n5 2\n10 2\n',
      expectedStdout: '1\n101\n1010\n',
    },
    // Octal.
    { id: '8964fbb4', stdin: '8 8\n511 8\n', expectedStdout: '10\n777\n' },
    // Decimal.
    { id: '8af40ea3', stdin: '12345 10\n', expectedStdout: '12345\n' },
    // Bases that aren't powers of 2.
    { id: '8dfec6f4', stdin: '100 3\n100 7\n', expectedStdout: '10201\n202\n' },
    // Zero in several bases.
    {
      id: '8fdaae46',
      stdin: '0 2\n0 16\n0 36\n',
      expectedStdout: '0\n0\n0\n',
    },
    // Negative numbers.
    {
      id: '92436aa8',
      stdin: '-255 16\n-5 2\n-1 10\n',
      expectedStdout: '-ff\n-101\n-1\n',
    },
    // Base 36 uses every letter up to z.
    {
      id: '97e592ff',
      stdin: '35 36\n36 36\n1295 36\n',
      expectedStdout: 'z\n10\nzz\n',
    },
    // The largest and largest negative ints.
    {
      id: '9b6d2a39',
      stdin: '2147483647 2\n-2147483648 2\n-2147483648 16\n2147483647 36\n',
      expectedStdout:
        '1'.repeat(31) + '\n-1' + '0'.repeat(31) + '\n-80000000\nzik0zj\n',
    },
    // A last line with no newline.
    { id: '9c200b7c', stdin: '10 16\n255 16', expectedStdout: 'a\nff\n' },
    // Every base from 2 to 36.
    {
      id: '9c3d5a5a',
      stdin: STRESS.map((t) => t.input).join(''),
      expectedStdout: STRESS.map((t) => t.output).join(''),
    },
  ],
};
