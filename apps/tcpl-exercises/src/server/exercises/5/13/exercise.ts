import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// "1\n" up to "<n>\n".
const numbered = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${from + i}\n`).join('');

const LONG_LINES = ['a', 'b', 'c'].map((ch) => ch.repeat(1000) + '\n');

export const exercise5_13: ExerciseSource = {
  id: '5-13',
  chapter: 5,
  number: 13,
  title: 'tail',
  summary:
    'Write tail, which prints the last n lines of its input: 10 by default, or n with tail -n. K&R exercise 5-13, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'a4175131', expectedStdout: '' },
    // The last 10 lines by default.
    { id: '409e5a54', stdin: numbered(1, 15), expectedStdout: numbered(6, 15) },
    // Fewer than 10 lines: all of them.
    { id: 'b3b229d0', stdin: numbered(1, 3), expectedStdout: numbered(1, 3) },
    // -n chooses how many.
    {
      id: 'f6b01392',
      args: ['-3'],
      stdin: numbered(1, 5),
      expectedStdout: numbered(3, 5),
    },
    // -1: just the last line.
    {
      id: '3559bac3',
      args: ['-1'],
      stdin: numbered(1, 5),
      expectedStdout: '5\n',
    },
    // n far larger than the input.
    {
      id: '4d2da458',
      args: ['-1000000'],
      stdin: numbered(1, 3),
      expectedStdout: numbered(1, 3),
    },
    // -0: nothing.
    { id: '50ad075e', args: ['-0'], stdin: numbered(1, 5), expectedStdout: '' },
    // Blank lines count as lines.
    {
      id: 'f3699a75',
      args: ['-2'],
      stdin: 'a\n\n\nb\n\n',
      expectedStdout: 'b\n\n',
    },
    // A last line with no newline is printed without one.
    { id: '24fbeff6', args: ['-2'], stdin: 'x\ny\nz', expectedStdout: 'y\nz' },
    // A single line with no newline.
    { id: '036a7de5', args: ['-1'], stdin: 'only', expectedStdout: 'only' },
    // 1000-character lines.
    {
      id: '9b0da18c',
      args: ['-2'],
      stdin: LONG_LINES.join(''),
      expectedStdout: LONG_LINES.slice(1).join(''),
    },
    // The last 1000 of 5000 lines.
    {
      id: 'fccbd698',
      args: ['-1000'],
      stdin: numbered(1, 5000),
      expectedStdout: numbered(4001, 5000),
    },
  ],
};
