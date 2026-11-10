import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_8: ExerciseSource = {
  id: '1-8',
  chapter: 1,
  number: 8,
  title: 'Count blanks, tabs, and newlines',
  summary:
    'Write a C program that counts the blanks, tabs, and newlines in its input. K&R exercise 1-8, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '830d0bba', expectedStdout: '0 0 0\n' },
    // No blanks, tabs or newlines, and no final newline.
    { id: 'e723a745', stdin: 'abc', expectedStdout: '0 0 0\n' },
    // One of each.
    { id: '78fff04a', stdin: 'a b\tc\n', expectedStdout: '1 1 1\n' },
    // Blank lines only.
    { id: '0184682f', stdin: '\n\n\n', expectedStdout: '0 0 3\n' },
    // Consecutive blanks, nothing else.
    { id: '3beb6c7b', stdin: '   ', expectedStdout: '3 0 0\n' },
    // Tabs only.
    { id: '25195b07', stdin: '\t\t', expectedStdout: '0 2 0\n' },
    // A mix, with a blank line and trailing blanks.
    {
      id: '240b35cb',
      stdin: '  a\t\tb\n\nc  \n',
      expectedStdout: '4 2 3\n',
    },
    // Other whitespace (carriage return, form feed, vertical tab) isn't counted.
    { id: '66088b2d', stdin: 'a\rb\fc\vd\n', expectedStdout: '0 0 1\n' },
    // 15,000 characters.
    {
      id: 'be628f2b',
      stdin: ' \t\n'.repeat(5000),
      expectedStdout: '5000 5000 5000\n',
    },
  ],
};
