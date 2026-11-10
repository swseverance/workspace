import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// With MAXLINE 1000, longest holds at most 999 characters.
const KEPT = 999;
const DIGITS = '0123456789'.repeat(500);

export const exercise1_16: ExerciseSource = {
  id: '1-16',
  chapter: 1,
  number: 16,
  title: 'Longest line of any length',
  summary:
    'Print the length of the longest input line, however long, and as much of its text as fits. K&R exercise 1-16, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input: no lines, no output.
    { id: '7d8364e2', expectedStdout: '' },
    // One line; the length counts the newline.
    { id: 'eddd10b0', stdin: 'hello\n', expectedStdout: '6\nhello\n' },
    // The longest of several lines.
    { id: '71970f59', stdin: 'a\nabc\nab\n', expectedStdout: '4\nabc\n' },
    // The first of equally long lines.
    { id: '7649e76a', stdin: 'abc\nxyz\n', expectedStdout: '4\nabc\n' },
    // A last line with no newline, which gets one added.
    { id: '0fbfc74d', stdin: 'ab\nabcd', expectedStdout: '4\nabcd\n' },
    // Blank lines only.
    { id: 'e81645a5', stdin: '\n\n', expectedStdout: '1\n\n' },
    // 998 characters and a newline: all of it fits.
    {
      id: '1f7d15d0',
      stdin: 'x'.repeat(998) + '\n',
      expectedStdout: '999\n' + 'x'.repeat(998) + '\n',
    },
    // 999 characters and a newline: the newline no longer fits.
    {
      id: '007b3c07',
      stdin: 'x'.repeat(999) + '\n',
      expectedStdout: '1000\n' + 'x'.repeat(999) + '\n',
    },
    // A 5,000-character line: only its start is printed.
    {
      id: '66d0e084',
      stdin: DIGITS + '\n',
      expectedStdout: '5001\n' + DIGITS.slice(0, KEPT) + '\n',
    },
    // Two long lines: the text comes from the longer one.
    {
      id: '68d852bb',
      stdin: 'a'.repeat(2000) + '\n' + 'b'.repeat(3000) + '\n',
      expectedStdout: '3001\n' + 'b'.repeat(KEPT) + '\n',
    },
    // A long line, then a short one that mustn't overwrite its text.
    {
      id: '2e388bb7',
      stdin: 'a'.repeat(1500) + '\n' + 'b'.repeat(10) + '\n',
      expectedStdout: '1501\n' + 'a'.repeat(KEPT) + '\n',
    },
    // A long last line with no newline.
    {
      id: '1135a927',
      stdin: 'x'.repeat(1200),
      expectedStdout: '1200\n' + 'x'.repeat(KEPT) + '\n',
    },
  ],
};
