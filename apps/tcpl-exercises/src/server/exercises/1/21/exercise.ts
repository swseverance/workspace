import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_21: ExerciseSource = {
  id: '1-21',
  chapter: 1,
  number: 21,
  title: 'Entab',
  summary:
    'Replace runs of blanks with the fewest tabs and blanks that give the same spacing. K&R exercise 1-21, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'c9ee1224', expectedStdout: '' },
    // No blanks.
    { id: '8e55ebfa', stdin: 'abc\n', expectedStdout: 'abc\n' },
    // Single blanks stay.
    { id: 'e99cf0aa', stdin: 'a b c\n', expectedStdout: 'a b c\n' },
    // Eight blanks at the start of a line.
    { id: '83edc709', stdin: '        x\n', expectedStdout: '\tx\n' },
    // Blanks that reach a tab stop.
    { id: 'ddabb0a3', stdin: 'abc     x\n', expectedStdout: 'abc\tx\n' },
    // Blanks that don't reach a tab stop stay.
    { id: 'e1159699', stdin: 'ab  c\n', expectedStdout: 'ab  c\n' },
    // One blank reaching a tab stop stays a blank.
    { id: '3c0323da', stdin: 'abcdefg x\n', expectedStdout: 'abcdefg x\n' },
    // A blank, then a tab for the rest.
    {
      id: '6b291f3e',
      stdin: 'abcdefg         x\n',
      expectedStdout: 'abcdefg \tx\n',
    },
    // A tab, then blanks past the stop.
    { id: '6bdf0f34', stdin: 'ab          x\n', expectedStdout: 'ab\t    x\n' },
    // Tabs in the input are copied, and move the column.
    { id: 'e58352ab', stdin: 'a\t        b\n', expectedStdout: 'a\t\tb\n' },
    // Blanks at the end of a line.
    { id: '72197001', stdin: 'abc     \n', expectedStdout: 'abc\t\n' },
    // Each line starts at column 0.
    {
      id: 'e96f1177',
      stdin: 'abcd\n        x\n',
      expectedStdout: 'abcd\n\tx\n',
    },
    // No final newline.
    { id: '6230c2b2', stdin: 'ab      x', expectedStdout: 'ab\tx' },
    // 200 tab stops on one line.
    {
      id: 'f7418f9d',
      stdin: ('abc' + ' '.repeat(5)).repeat(200) + 'x\n',
      expectedStdout: 'abc\t'.repeat(200) + 'x\n',
    },
  ],
};
