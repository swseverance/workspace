import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_6: ExerciseSource = {
  id: '1-6',
  chapter: 1,
  number: 6,
  title: 'Verify getchar() != EOF',
  summary:
    'Print the value of getchar() != EOF for each character read to show it is always 0 or 1. K&R exercise 1-6, solved and tested in your browser.',
  description,
  solution,
  // One 1 per character read, then a 0 at the end of input.
  tests: [
    // Empty input.
    { id: '22f248c9', expectedStdout: '0\n' },
    // One character, no newline.
    { id: 'a5dd10e0', stdin: 'a', expectedStdout: '1\n0\n' },
    // Several lines.
    {
      id: '4cc1b99e',
      stdin: 'ab\ncd\n',
      expectedStdout: '1\n'.repeat(6) + '0\n',
    },
    // Whitespace and blank lines are characters too.
    {
      id: '8dd995f3',
      stdin: ' \t\n\n',
      expectedStdout: '1\n'.repeat(4) + '0\n',
    },
    // 1,000 characters.
    {
      id: 'eba19051',
      stdin: 'abc\n'.repeat(250),
      expectedStdout: '1\n'.repeat(1000) + '0\n',
    },
  ],
};
