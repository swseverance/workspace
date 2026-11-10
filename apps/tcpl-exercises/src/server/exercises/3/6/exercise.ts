import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// -123 at every width from 0 to 100.
const WIDTHS = Array.from({ length: 101 }, (_, w) => w);

export const exercise3_6: ExerciseSource = {
  id: '3-6',
  chapter: 3,
  number: 6,
  title: 'itoa with a minimum field width',
  summary:
    'Convert an integer to a string, padded with blanks on the left to a minimum field width. K&R exercise 3-6, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'a08e18e3', expectedStdout: '' },
    // Padding to the width.
    { id: 'a472a225', stdin: '42 5\n', expectedStdout: '   42\n' },
    // Exactly as wide as the width.
    { id: 'a7902717', stdin: '12345 5\n', expectedStdout: '12345\n' },
    // Wider than the width: no padding, nothing cut off.
    { id: 'aaf18b6f', stdin: '123456 3\n', expectedStdout: '123456\n' },
    // Widths of 0 and 1.
    { id: 'abd946db', stdin: '7 0\n7 1\n', expectedStdout: '7\n7\n' },
    // The minus sign counts towards the width.
    {
      id: 'b5dcc40e',
      stdin: '-42 5\n-42 3\n-42 2\n',
      expectedStdout: '  -42\n-42\n-42\n',
    },
    // Zero.
    { id: 'b6c4af0a', stdin: '0 4\n0 1\n', expectedStdout: '   0\n0\n' },
    // The largest and largest negative ints.
    {
      id: 'b70d9f46',
      stdin: '-2147483648 15\n2147483647 12\n-2147483648 0\n',
      expectedStdout: '    -2147483648\n  2147483647\n-2147483648\n',
    },
    // A last line with no newline.
    { id: 'bac4d5e6', stdin: '5 3', expectedStdout: '  5\n' },
    // Every width from 0 to 100.
    {
      id: 'bda34278',
      stdin: WIDTHS.map((w) => `-123 ${w}\n`).join(''),
      expectedStdout: WIDTHS.map(
        (w) => ' '.repeat(Math.max(0, w - 4)) + '-123\n',
      ).join(''),
    },
  ],
};
