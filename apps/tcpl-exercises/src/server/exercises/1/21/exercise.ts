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
    // A tab, then text, then blanks reaching the next tab stop.
    {
      id: '9b8486b2',
      stdin: 'ab\tcd      x\n',
      expectedStdout: 'ab\tcd\tx\n',
    },
    // A blank before a tab is dropped.
    {
      id: '93fa0325',
      stdin: ' \tab\n',
      expectedStdout: '\tab\n',
    },
    // Blanks before a tab are dropped.
    {
      id: '1d3bb3ec',
      stdin: 'ab  \tc\n',
      expectedStdout: 'ab\tc\n',
    },
    // Blanks past a tab stop, then a tab.
    {
      id: 'eb4b9686',
      stdin: 'ab          \tc\n',
      expectedStdout: 'ab\t\tc\n',
    },
    // A blank that reaches a tab stop stays, even before a tab.
    {
      id: '9ba26046',
      stdin: 'abcdefg \tx\n' + 'abcdefg    \tx\n',
      expectedStdout: 'abcdefg \tx\n' + 'abcdefg \tx\n',
    },
    // Blanks at the end of a line.
    { id: '72197001', stdin: 'abc     \n', expectedStdout: 'abc\t\n' },
    // Each line starts at column 0.
    {
      id: 'e96f1177',
      stdin: 'abcd\n        x\n',
      expectedStdout: 'abcd\n\tx\n',
    },
    // A blank line between two others.
    {
      id: '0ef31fa2',
      stdin: 'abc     x\n\nab      y\n',
      expectedStdout: 'abc\tx\n\nab\ty\n',
    },
    // No final newline.
    { id: '6230c2b2', stdin: 'ab      x', expectedStdout: 'ab\tx' },
    // Blanks at the end of the input, with no final newline.
    { id: 'd41f7a0c', stdin: 'abc  ', expectedStdout: 'abc  ' },
    // Blanks that reach a tab stop at the end of the input.
    { id: 'fa006f02', stdin: 'abc     ', expectedStdout: 'abc\t' },
    // Two blanks reaching a tab stop become a tab.
    {
      id: '55c8838f',
      stdin: 'abcdef  x\n',
      expectedStdout: 'abcdef\tx\n',
    },
    // Blanks across two tab stops.
    {
      id: '7943ac2a',
      stdin: 'ab              x\n',
      expectedStdout: 'ab\t\tx\n',
    },
    // Blanks reaching a tab stop past the first.
    {
      id: '46ee3ce5',
      stdin: 'abcdefghij      x\n',
      expectedStdout: 'abcdefghij\tx\n',
    },
    // Blanks that start at a tab stop.
    {
      id: '1ac6e4ec',
      stdin: 'abcdefgh x\n' + 'abcdefgh         x\n',
      expectedStdout: 'abcdefgh x\n' + 'abcdefgh\t x\n',
    },
    // Several runs of blanks on one line.
    {
      id: '194cf12b',
      stdin: 'a  b     c   d\n',
      expectedStdout: 'a  b\t c   d\n',
    },
    // A line of only blanks.
    {
      id: '96e46554',
      stdin: '                    \n',
      expectedStdout: '\t\t    \n',
    },
    // Four lines of a table.
    {
      id: '4ad46738',
      stdin:
        'name    qty     price\n' +
        'apple   3       0.50\n' +
        'watermelon      12      4.25\n' +
        'fig     100     10.00\n',
      expectedStdout:
        'name\tqty\tprice\n' +
        'apple\t3\t0.50\n' +
        'watermelon\t12\t4.25\n' +
        'fig\t100\t10.00\n',
    },
    // 200 tab stops on one line.
    {
      id: 'f7418f9d',
      stdin: ('abc' + ' '.repeat(5)).repeat(200) + 'x\n',
      expectedStdout: 'abc\t'.repeat(200) + 'x\n',
    },
  ],
};
