import { ExerciseSource } from '../../../../models/exercise';
import sort from '../sort.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 000 to 999 with punctuation between the digits, shuffled: 37 shares no
// factor with 1000. With -d each line compares as its three digits.
const PUNCT = ['-', '.', ',', '/', '(', '!'];
const line = (n: number) => {
  const [a, b, c] = String(n).padStart(3, '0');
  return `${a}${PUNCT[n % 6]}${b}${PUNCT[(n + 1) % 6]}${c}`;
};
const SHUFFLED = Array.from({ length: 1000 }, (_, k) => (k * 37) % 1000);

export const exercise5_16: ExerciseSource = {
  id: '5-16',
  chapter: 5,
  number: 16,
  title: 'sort -d',
  summary:
    'Add -d for directory order to the sort program, comparing only letters, digits and blanks, with -f too. K&R exercise 5-16, solved and tested in your browser.',
  description: `${description}\n${sort}`,
  solution,
  tests: [
    // Empty input.
    { id: '3be5c61d', args: ['-d'], expectedStdout: '' },
    // -d skips punctuation.
    {
      id: '628e5e53',
      args: ['-d'],
      stdin: 'b-c\nab\na.c\n',
      expectedStdout: 'ab\na.c\nb-c\n',
    },
    // Without -d, punctuation counts.
    {
      id: 'd02c0db8',
      stdin: 'b-c\nab\na.c\n',
      expectedStdout: 'a.c\nab\nb-c\n',
    },
    // Blanks still count.
    {
      id: 'c3f2b83e',
      args: ['-d'],
      stdin: 'ab\na b\n',
      expectedStdout: 'a b\nab\n',
    },
    // Digits still count.
    {
      id: '7258e2ed',
      args: ['-d'],
      stdin: 'x-2\nx1\n',
      expectedStdout: 'x1\nx-2\n',
    },
    // Without -f, case still counts.
    {
      id: '1586f402',
      args: ['-d'],
      stdin: 'b\nA\n_a\n',
      expectedStdout: 'A\n_a\nb\n',
    },
    // -df together.
    {
      id: '6906a154',
      args: ['-df'],
      stdin: 'b\nA\n_c\n',
      expectedStdout: 'A\nb\n_c\n',
    },
    // -f and -d as separate options.
    {
      id: 'a6cd0f33',
      args: ['-f', '-d'],
      stdin: 'Zebra!\napple\n(Mango)\n',
      expectedStdout: 'apple\n(Mango)\nZebra!\n',
    },
    // -d with -r.
    {
      id: '6d94787f',
      args: ['-dr'],
      stdin: 'b-c\nab\na.c\n',
      expectedStdout: 'b-c\na.c\nab\n',
    },
    // A line of only punctuation compares as empty.
    {
      id: 'afa4b340',
      args: ['-d'],
      stdin: 'a\n...\n',
      expectedStdout: '...\na\n',
    },
    // A last line with no newline.
    { id: '29e03bc9', args: ['-d'], stdin: 'b\n-a', expectedStdout: '-a\nb\n' },
    // 1000 lines with punctuation between their digits.
    {
      id: 'c5d37ed4',
      args: ['-d'],
      stdin: SHUFFLED.map((n) => `${line(n)}\n`).join(''),
      expectedStdout: Array.from(
        { length: 1000 },
        (_, n) => `${line(n)}\n`,
      ).join(''),
    },
  ],
};
