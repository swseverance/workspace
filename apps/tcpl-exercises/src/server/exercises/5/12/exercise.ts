import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise5_12: ExerciseSource = {
  id: '5-12',
  chapter: 5,
  number: 12,
  title: 'entab -m +n',
  summary:
    'Extend entab to take tab stops every n columns starting at column m, written entab -m +n. K&R exercise 5-12, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'fbc6759a', args: ['+4'], expectedStdout: '' },
    // No arguments: a tab stop every 8 columns.
    { id: '3f77aba4', stdin: '        x\n', expectedStdout: '\tx\n' },
    // +n alone: every n columns from column 0.
    {
      id: 'd3c76eee',
      args: ['+4'],
      stdin: '    x\n        y\n',
      expectedStdout: '\tx\n\t\ty\n',
    },
    // -m alone: every 8 columns from column m.
    {
      id: 'b6170327',
      args: ['-4'],
      stdin: '    x\n            y\n',
      expectedStdout: '\tx\n\t\ty\n',
    },
    // -m and +n together.
    {
      id: 'e13dfc91',
      args: ['-2', '+3'],
      stdin: '  a\n     b\n        c\n',
      expectedStdout: '\ta\n\t\tb\n\t\t\tc\n',
    },
    // No tab stops before column m.
    {
      id: 'aceeba70',
      args: ['-10', '+4'],
      stdin: '        x\n          y\n',
      expectedStdout: '        x\n\ty\n',
    },
    // One blank reaching a tab stop stays a blank; two become a tab.
    {
      id: 'bf61d4ae',
      args: ['+4'],
      stdin: 'abc d\nab  c\n',
      expectedStdout: 'abc d\nab\tc\n',
    },
    // Blanks that don't reach a tab stop stay.
    { id: '19189d78', args: ['+4'], stdin: 'a  b\n', expectedStdout: 'a  b\n' },
    // Tabs in the input are copied, and move to the next tab stop.
    {
      id: 'baa3f6b6',
      args: ['+4'],
      stdin: 'a\t  b\na\t    x\n',
      expectedStdout: 'a\t  b\na\t\tx\n',
    },
    // Each line starts again at column 0.
    {
      id: 'c0e9667b',
      args: ['+4'],
      stdin: '  ab  \n    c\n',
      expectedStdout: '  ab  \n\tc\n',
    },
    // A last line with no newline.
    { id: '30fe6a41', args: ['+4'], stdin: '    x', expectedStdout: '\tx' },
    // 101 tab stops on one line.
    {
      id: '2a90ff3e',
      args: ['-3', '+5'],
      stdin: ' '.repeat(503) + 'x\n',
      expectedStdout: '\t'.repeat(101) + 'x\n',
    },
  ],
};
