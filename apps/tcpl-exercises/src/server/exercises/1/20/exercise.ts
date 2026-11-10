import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_20: ExerciseSource = {
  id: '1-20',
  chapter: 1,
  number: 20,
  title: 'Detab',
  summary:
    'Replace each tab with the blanks needed to reach the next tab stop. K&R exercise 1-20, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '25d9fa35', expectedStdout: '' },
    // No tabs.
    { id: '80b78d90', stdin: 'abc\n', expectedStdout: 'abc\n' },
    // A tab at the start of a line.
    { id: 'a06b7be7', stdin: '\tx\n', expectedStdout: '        x\n' },
    // A tab after three characters.
    { id: '152b29d7', stdin: 'abc\tx\n', expectedStdout: 'abc     x\n' },
    // A tab one column before a stop, and exactly at one.
    {
      id: '06010df1',
      stdin: 'abcdefg\tx\nabcdefgh\tx\n',
      expectedStdout: 'abcdefg x\nabcdefgh        x\n',
    },
    // Consecutive tabs.
    {
      id: 'e0a0f627',
      stdin: 'a\t\tb\n',
      expectedStdout: 'a               b\n',
    },
    // Each line starts at column 0.
    {
      id: '8567bf02',
      stdin: 'abc\tx\n\ty\n',
      expectedStdout: 'abc     x\n        y\n',
    },
    // A tab at the end of a line.
    { id: 'f697084e', stdin: 'ab\t\n', expectedStdout: 'ab      \n' },
    // No final newline.
    { id: '314f7462', stdin: 'a\tb', expectedStdout: 'a       b' },
    // A blank before a tab.
    { id: 'b286e933', stdin: ' \tx\n', expectedStdout: '        x\n' },
    // 200 tabs on one line.
    {
      id: '29a72741',
      stdin: 'abc\t'.repeat(200) + '\n',
      expectedStdout: 'abc     '.repeat(200) + '\n',
    },
  ],
};
