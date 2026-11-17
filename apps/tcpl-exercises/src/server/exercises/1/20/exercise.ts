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
    // A tab past the first stop.
    {
      id: '375daa5d',
      stdin: 'abcdefghij\tx\n',
      expectedStdout: 'abcdefghij      x\n',
    },
    // Tabs after text of different lengths.
    {
      id: 'a07b112d',
      stdin: 'a\tbc\tdef\tg\n',
      expectedStdout: 'a       bc      def     g\n',
    },
    // A tab alone on a line.
    { id: '604a7511', stdin: '\t\n', expectedStdout: '        \n' },
    // The line after a tab at the end of a line starts at column 0.
    {
      id: '4e125580',
      stdin: 'ab\t\ncd\tx\n',
      expectedStdout: 'ab      \ncd      x\n',
    },
    // Blanks after a tab stay.
    { id: 'af745440', stdin: 'a\t  b\n', expectedStdout: 'a         b\n' },
    // Four lines of a table.
    {
      id: '22322a40',
      stdin:
        'name\tqty\tprice\n' +
        'apple\t3\t0.50\n' +
        'watermelon\t12\t4.25\n' +
        'fig\t100\t10.00\n',
      expectedStdout:
        'name    qty     price\n' +
        'apple   3       0.50\n' +
        'watermelon      12      4.25\n' +
        'fig     100     10.00\n',
    },
    // 200 tabs on one line.
    {
      id: '29a72741',
      stdin: 'abc\t'.repeat(200) + '\n',
      expectedStdout: 'abc     '.repeat(200) + '\n',
    },
  ],
};
