import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_18: ExerciseSource = {
  id: '1-18',
  chapter: 1,
  number: 18,
  title: 'Remove trailing blanks and tabs',
  summary:
    'Remove trailing blanks and tabs from each line of input, and delete blank lines. K&R exercise 1-18, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '025f67ec', expectedStdout: '' },
    // Nothing to remove.
    { id: 'ad438772', stdin: 'abc\n', expectedStdout: 'abc\n' },
    // Trailing blanks.
    { id: '208dd73a', stdin: 'abc   \n', expectedStdout: 'abc\n' },
    // Trailing blanks and tabs, mixed.
    { id: '3f1b9284', stdin: 'abc \t \t\n', expectedStdout: 'abc\n' },
    // Leading and inner blanks and tabs stay.
    { id: '84c64697', stdin: '  a  b\t c  \n', expectedStdout: '  a  b\t c\n' },
    // Empty lines are deleted.
    { id: '4811a690', stdin: 'a\n\n\nb\n', expectedStdout: 'a\nb\n' },
    // Lines of only blanks and tabs are deleted.
    { id: 'b763cc74', stdin: 'a\n  \t \nb\n', expectedStdout: 'a\nb\n' },
    // No final newline.
    { id: '481ef70c', stdin: 'abc  ', expectedStdout: 'abc' },
    // A last line of only blanks, with no newline.
    { id: 'f5a3feab', stdin: 'a\n   ', expectedStdout: 'a\n' },
    // A carriage return isn't a blank or tab.
    { id: '6d06f179', stdin: 'abc\r\n', expectedStdout: 'abc\r\n' },
    // A long run of trailing blanks and tabs.
    {
      id: '562bf8da',
      stdin: 'x'.repeat(300) + ' \t'.repeat(300) + '\n',
      expectedStdout: 'x'.repeat(300) + '\n',
    },
    // 1,000 lines.
    {
      id: '15cbe116',
      stdin: ('a b \t\n' + ' \n').repeat(500),
      expectedStdout: 'a b\n'.repeat(500),
    },
  ],
};
