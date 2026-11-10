import { ExerciseSource } from '../../../../models/exercise';
import sort from '../sort.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 0 to 999, shuffled: 37 shares no factor with 1000.
const SHUFFLED = Array.from({ length: 1000 }, (_, k) => (k * 37) % 1000);

export const exercise5_14: ExerciseSource = {
  id: '5-14',
  chapter: 5,
  number: 14,
  title: 'sort -r',
  summary:
    'Add a -r flag to the sort program to sort in reverse order, working with -n too. K&R exercise 5-14, solved and tested in your browser.',
  description: `${description}\n${sort}`,
  solution,
  tests: [
    // Empty input.
    { id: '0f0f5647', expectedStdout: '' },
    // No options: increasing order.
    { id: '0b3604af', stdin: 'b\na\nc\n', expectedStdout: 'a\nb\nc\n' },
    // -r: decreasing order.
    {
      id: '46918c62',
      args: ['-r'],
      stdin: 'b\na\nc\n',
      expectedStdout: 'c\nb\na\n',
    },
    // -n: numeric order.
    {
      id: 'a9eac1fb',
      args: ['-n'],
      stdin: '10\n9\n100\n',
      expectedStdout: '9\n10\n100\n',
    },
    // -n and -r as separate options.
    {
      id: '52fbb4ab',
      args: ['-n', '-r'],
      stdin: '10\n9\n100\n',
      expectedStdout: '100\n10\n9\n',
    },
    // -nr together.
    {
      id: 'a8f193d9',
      args: ['-nr'],
      stdin: '2\n30\n4\n',
      expectedStdout: '30\n4\n2\n',
    },
    // -rn, the other way round.
    {
      id: '61afc9aa',
      args: ['-rn'],
      stdin: '2\n30\n4\n',
      expectedStdout: '30\n4\n2\n',
    },
    // Negative numbers and fractions, both ways.
    {
      id: '466f822d',
      args: ['-n'],
      stdin: '-1\n2.5\n-10\n0\n',
      expectedStdout: '-10\n-1\n0\n2.5\n',
    },
    {
      id: '5cff4764',
      args: ['-nr'],
      stdin: '-1\n2.5\n-10\n0\n',
      expectedStdout: '2.5\n0\n-1\n-10\n',
    },
    // Repeated lines in reverse.
    {
      id: '2a7686a4',
      args: ['-r'],
      stdin: 'a\nb\na\n',
      expectedStdout: 'b\na\na\n',
    },
    // Lower case comes before upper case in reverse.
    {
      id: 'ad08d234',
      args: ['-r'],
      stdin: 'B\na\nA\nb\n',
      expectedStdout: 'b\na\nB\nA\n',
    },
    // A last line with no newline.
    { id: '7a1f0d91', args: ['-r'], stdin: 'a\nb', expectedStdout: 'b\na\n' },
    // 1000 numbers in decreasing numeric order.
    {
      id: '4cd7b3a0',
      args: ['-nr'],
      stdin: SHUFFLED.map((n) => `${n}\n`).join(''),
      expectedStdout: Array.from(
        { length: 1000 },
        (_, i) => `${999 - i}\n`,
      ).join(''),
    },
  ],
};
