import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const DIGITS = '0123456789'.repeat(90);
// With MAXLINE 1000, the longest line that fits: 998 characters, a newline
// and the terminating '\0'.
const LONGEST = 'abcdefghijklmnopqrstuvwxyz'.repeat(39).slice(0, 998);

const reversed = (text: string) => [...text].reverse().join('');

export const exercise1_19: ExerciseSource = {
  id: '1-19',
  chapter: 1,
  number: 19,
  title: 'Reverse each line',
  summary:
    'Write a reverse function and use it to reverse the input one line at a time. K&R exercise 1-19, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '1dc914e6', expectedStdout: '' },
    // One line.
    { id: '832fef1d', stdin: 'abc\n', expectedStdout: 'cba\n' },
    // Each line is reversed separately.
    { id: '7044fb30', stdin: 'abc\nhello\n', expectedStdout: 'cba\nolleh\n' },
    // One character.
    { id: '6859a42f', stdin: 'a\n', expectedStdout: 'a\n' },
    // Even and odd lengths.
    { id: '69490ad7', stdin: 'ab\nabcd\n', expectedStdout: 'ba\ndcba\n' },
    // An empty line stays empty.
    { id: 'e0ac65cc', stdin: 'a\n\nb\n', expectedStdout: 'a\n\nb\n' },
    // Blanks and tabs are reversed too.
    { id: '8667ba51', stdin: '  a\t\n', expectedStdout: '\ta  \n' },
    // No final newline.
    { id: '87b537dc', stdin: 'abc', expectedStdout: 'cba' },
    // A short line after a long one, which mustn't pick up its leftovers.
    {
      id: 'ccac89b3',
      stdin: 'abcdefgh\nxy\n',
      expectedStdout: 'hgfedcba\nyx\n',
    },
    // The whole line is reversed, not each word.
    {
      id: '8cfabd2c',
      stdin: 'hello, world\n',
      expectedStdout: 'dlrow ,olleh\n',
    },
    // Only empty lines.
    { id: 'e7b28f5e', stdin: '\n\n\n', expectedStdout: '\n\n\n' },
    // Several lines, the last with no newline: none is added or moved.
    { id: 'ac5cd831', stdin: 'ab\ncd\nef', expectedStdout: 'ba\ndc\nfe' },
    // A 900-character line.
    {
      id: '3afd25bc',
      stdin: DIGITS + '\n',
      expectedStdout: reversed(DIGITS) + '\n',
    },
    // The longest line that fits in the array.
    {
      id: '46cd70ba',
      stdin: LONGEST + '\n',
      expectedStdout: reversed(LONGEST) + '\n',
    },
    // 2,000 lines.
    {
      id: '9238190f',
      stdin: 'abc\n'.repeat(2000),
      expectedStdout: 'cba\n'.repeat(2000),
    },
  ],
};
