import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise5_3: ExerciseSource = {
  id: '5-3',
  chapter: 5,
  number: 3,
  title: 'strcat with pointers',
  summary:
    'Write a pointer version of strcat, which copies one string to the end of another. K&R exercise 5-3, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '0f127442', expectedStdout: '' },
    // Two words.
    {
      id: 'd96f442b',
      stdin: 'hello, \nworld\n',
      expectedStdout: 'hello, world\n',
    },
    // An empty t.
    { id: '91f6a224', stdin: 'abc\n\n', expectedStdout: 'abc\n' },
    // An empty s.
    { id: 'f146d194', stdin: '\nxyz\n', expectedStdout: 'xyz\n' },
    // Both empty.
    { id: '16282536', stdin: '\n\n', expectedStdout: '\n' },
    // Several pairs.
    { id: 'e372dfe8', stdin: 'a\nb\nc\nd\n', expectedStdout: 'ab\ncd\n' },
    // Blanks and tabs are kept.
    { id: '29523f02', stdin: ' a\t\n b \n', expectedStdout: ' a\t b \n' },
    // A last line with no newline.
    { id: '16a66faa', stdin: 'foo\nbar', expectedStdout: 'foobar\n' },
    // Two 1000-character lines.
    {
      id: 'a3d8c368',
      stdin: 'x'.repeat(1000) + '\n' + 'y'.repeat(1000) + '\n',
      expectedStdout: 'x'.repeat(1000) + 'y'.repeat(1000) + '\n',
    },
  ],
};
