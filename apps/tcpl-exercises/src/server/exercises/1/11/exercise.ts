import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_11: ExerciseSource = {
  id: '1-11',
  chapter: 1,
  number: 11,
  title: 'Word count',
  summary:
    'Count the lines, words, and characters in the input, like the Unix wc program. K&R exercise 1-11, solved and tested in your browser.',
  description,
  solution,
  // Each output is lines, words, characters.
  tests: [
    // Empty input.
    { id: 'f76a77bb', expectedStdout: '0 0 0\n' },
    // One word.
    { id: 'bbaea022', stdin: 'hello\n', expectedStdout: '1 1 6\n' },
    // Two words.
    { id: 'c75609e6', stdin: 'hello world\n', expectedStdout: '1 2 12\n' },
    // No final newline: no complete line.
    { id: '5d44de2b', stdin: 'hello world', expectedStdout: '0 2 11\n' },
    // Several blanks between words.
    { id: '971f3660', stdin: 'a   b\n', expectedStdout: '1 2 6\n' },
    // Tabs separate words too.
    { id: 'becc735e', stdin: 'a\tb\t\tc\n', expectedStdout: '1 3 7\n' },
    // Leading and trailing blanks.
    { id: 'd1545b27', stdin: '  a b  \n', expectedStdout: '1 2 8\n' },
    // Blank lines.
    { id: '7a942217', stdin: '\n\n\n', expectedStdout: '3 0 3\n' },
    // A line of only blanks and tabs.
    { id: '7b4614b6', stdin: ' \t \n', expectedStdout: '1 0 4\n' },
    // Words on separate lines.
    {
      id: '7bbfc9ec',
      stdin: 'one\ntwo\nthree\n',
      expectedStdout: '3 3 14\n',
    },
    // Punctuation is part of a word.
    {
      id: '888e9008',
      stdin: "don't stop--now!\n",
      expectedStdout: '1 2 17\n',
    },
    // Carriage returns and form feeds don't separate words.
    { id: 'dd12ed78', stdin: 'a\rb\fc\n', expectedStdout: '1 1 6\n' },
    // 2,000 words on one line.
    {
      id: 'fdcc5649',
      stdin: 'word '.repeat(2000) + '\n',
      expectedStdout: '1 2000 10001\n',
    },
    // 3,000 lines.
    {
      id: '918fbd05',
      stdin: 'a b\n'.repeat(3000),
      expectedStdout: '3000 6000 12000\n',
    },
  ],
};
