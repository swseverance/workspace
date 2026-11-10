import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 100 tab stops, every 5 columns from 5 to 500.
const STOPS = Array.from({ length: 100 }, (_, i) => `${5 * (i + 1)}`);

export const exercise5_11: ExerciseSource = {
  id: '5-11',
  chapter: 5,
  number: 11,
  title: 'detab with a list of tab stops',
  summary:
    'Extend detab to take a list of tab stops as arguments, using tab stops every 8 columns without them. K&R exercise 5-11, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '16647b61', args: ['4'], expectedStdout: '' },
    // No arguments: a tab stop every 8 columns.
    { id: '81230216', stdin: 'a\tb\n', expectedStdout: 'a       b\n' },
    // A tab at the start of a line.
    {
      id: '92fde208',
      args: ['4', '10', '20'],
      stdin: '\tx\n',
      expectedStdout: '    x\n',
    },
    // A tab after some text.
    {
      id: 'b2d009ac',
      args: ['4', '10', '20'],
      stdin: 'ab\tc\n',
      expectedStdout: 'ab  c\n',
    },
    // A tab right at a tab stop moves to the next one.
    {
      id: 'b157c691',
      args: ['4', '10', '20'],
      stdin: 'abcd\tx\n',
      expectedStdout: 'abcd      x\n',
    },
    // Several tabs in a row.
    {
      id: '9d1724aa',
      args: ['4', '10', '20'],
      stdin: '\t\t\tx\n',
      expectedStdout: ' '.repeat(20) + 'x\n',
    },
    // Past the last tab stop, a tab is a single blank.
    {
      id: 'e341dbbc',
      args: ['4', '10', '20'],
      stdin: '\t\t\t\tx\n' + 'a'.repeat(22) + '\tz\n',
      expectedStdout: ' '.repeat(21) + 'x\n' + 'a'.repeat(22) + ' z\n',
    },
    // A single tab stop.
    {
      id: 'ec848d21',
      args: ['3'],
      stdin: '\ta\tb\n',
      expectedStdout: '   a b\n',
    },
    // Each line starts again at column 0.
    {
      id: '6fe7d4e0',
      args: ['4'],
      stdin: 'ab\tc\n\td\n',
      expectedStdout: 'ab  c\n    d\n',
    },
    // No tabs: nothing changes.
    {
      id: '8474494e',
      args: ['4'],
      stdin: 'hello world\n',
      expectedStdout: 'hello world\n',
    },
    // A last line with no newline.
    { id: 'e696fdd4', args: ['4'], stdin: 'a\tb', expectedStdout: 'a   b' },
    // 100 tab stops, and one tab past them.
    {
      id: 'a2106563',
      args: STOPS,
      stdin: '\t'.repeat(101) + 'x\n',
      expectedStdout: ' '.repeat(501) + 'x\n',
    },
  ],
};
