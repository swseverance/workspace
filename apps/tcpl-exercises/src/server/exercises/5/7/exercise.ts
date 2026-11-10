import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 999 down to 000, which sort into 000 up to 999.
const COUNTDOWN = Array.from({ length: 1000 }, (_, i) =>
  String(999 - i).padStart(3, '0'),
);

// Five 1000-character lines, e down to a.
const LONG_LINES = ['e', 'd', 'c', 'b', 'a'].map((ch) => ch.repeat(1000));

export const exercise5_7: ExerciseSource = {
  id: '5-7',
  chapter: 5,
  number: 7,
  title: 'readlines without alloc',
  summary:
    "Rewrite the sort program's readlines to store lines in an array supplied by main instead of calling alloc. K&R exercise 5-7, solved and tested in your browser.",
  description,
  solution,
  tests: [
    // Empty input.
    { id: '01c43531', expectedStdout: '' },
    // A few words.
    {
      id: '28ae6679',
      stdin: 'banana\napple\ncherry\n',
      expectedStdout: 'apple\nbanana\ncherry\n',
    },
    // Reverse order.
    { id: 'b9e5cc9e', stdin: 'c\nb\na\n', expectedStdout: 'a\nb\nc\n' },
    // Repeated lines.
    { id: '8c2d69a3', stdin: 'b\na\nb\na\n', expectedStdout: 'a\na\nb\nb\n' },
    // Upper case comes before lower case.
    { id: 'e0ac6b63', stdin: 'b\nB\na\nA\n', expectedStdout: 'A\nB\na\nb\n' },
    // A line comes after its prefixes.
    {
      id: '71b13ea2',
      stdin: 'abc\nab\nabcd\na\n',
      expectedStdout: 'a\nab\nabc\nabcd\n',
    },
    // A blank line comes first.
    { id: 'cc9092a0', stdin: 'x\n\ny\n', expectedStdout: '\nx\ny\n' },
    // A leading blank counts.
    { id: 'df7f9d5a', stdin: 'a\n z\n', expectedStdout: ' z\na\n' },
    // Numbers sort as text.
    { id: '3169e4fb', stdin: '10\n9\n100\n', expectedStdout: '10\n100\n9\n' },
    // A last line with no newline keeps its last character.
    { id: '4fbad5c9', stdin: 'b\na', expectedStdout: 'a\nb\n' },
    // 1000 lines.
    {
      id: 'bbb1e442',
      stdin: COUNTDOWN.map((line) => `${line}\n`).join(''),
      expectedStdout: [...COUNTDOWN]
        .reverse()
        .map((line) => `${line}\n`)
        .join(''),
    },
    // 1000-character lines.
    {
      id: 'd0ff5def',
      stdin: LONG_LINES.map((line) => `${line}\n`).join(''),
      expectedStdout: [...LONG_LINES]
        .reverse()
        .map((line) => `${line}\n`)
        .join(''),
    },
  ],
};
