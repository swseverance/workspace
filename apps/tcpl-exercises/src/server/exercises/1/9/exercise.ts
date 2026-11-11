import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_9: ExerciseSource = {
  id: '1-9',
  chapter: 1,
  number: 9,
  title: 'Squeeze runs of blanks',
  summary:
    'Copy input to output, replacing each run of one or more blanks with a single blank. K&R exercise 1-9, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '93410031', expectedStdout: '' },
    // No blanks.
    { id: 'd823367a', stdin: 'abc\n', expectedStdout: 'abc\n' },
    // Single blanks are left alone.
    { id: '6fec4bd5', stdin: 'a b c\n', expectedStdout: 'a b c\n' },
    // Runs of blanks become one.
    { id: '1ea7c03c', stdin: 'a   b    c\n', expectedStdout: 'a b c\n' },
    // Leading blanks.
    { id: '9109f38a', stdin: '   a\n', expectedStdout: ' a\n' },
    // Trailing blanks before the newline.
    { id: '57d1e53f', stdin: 'a   \n', expectedStdout: 'a \n' },
    // Tabs aren't blanks, so they split runs and are kept.
    {
      id: 'ddd20bc6',
      stdin: 'a\t\t b  \t  c\n',
      expectedStdout: 'a\t\t b \t c\n',
    },
    // Blank lines, and a line of only blanks.
    { id: 'ad94c998', stdin: '\n    \n\n', expectedStdout: '\n \n\n' },
    // A run doesn't continue onto the next line.
    { id: '2f1187d8', stdin: 'a  \n  b\n', expectedStdout: 'a \n b\n' },
    // No final newline.
    { id: '5d4c96a5', stdin: 'a  b', expectedStdout: 'a b' },
    // One run of 10,000 blanks.
    {
      id: 'dd363207',
      stdin: 'a' + ' '.repeat(10_000) + 'b\n',
      expectedStdout: 'a b\n',
    },
    // 2,000 runs on one line.
    {
      id: '725d873d',
      stdin: 'a  '.repeat(2000) + '\n',
      expectedStdout: 'a '.repeat(2000) + '\n',
    },
  ],
};
