import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const LONG_LINE = '0123456789'.repeat(100) + '\n';

export const exercise4_7: ExerciseSource = {
  id: '4-7',
  chapter: 4,
  number: 7,
  title: 'Push back a whole string',
  summary:
    'Write ungets, which pushes an entire string back onto the input, and use it to print each line twice. K&R exercise 4-7, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'dc1f4aa6', expectedStdout: '' },
    // One line comes back in the same order.
    { id: '1c7ac327', stdin: 'hello\n', expectedStdout: 'hello\nhello\n' },
    // Several lines.
    {
      id: '0d16ddd7',
      stdin: 'one\ntwo\n',
      expectedStdout: 'one\none\ntwo\ntwo\n',
    },
    // A blank line.
    { id: 'f7030dae', stdin: 'a\n\nb\n', expectedStdout: 'a\na\n\n\nb\nb\n' },
    // Blanks and tabs are kept.
    {
      id: 'bf261929',
      stdin: ' a\tb  \n',
      expectedStdout: ' a\tb  \n a\tb  \n',
    },
    // A line with no newline.
    { id: '2330169f', stdin: 'end', expectedStdout: 'endend' },
    // A last line with no newline after others.
    {
      id: '8956622a',
      stdin: 'first\nlast',
      expectedStdout: 'first\nfirst\nlastlast',
    },
    // A 1000-character line is pushed back whole.
    { id: 'e622904b', stdin: LONG_LINE, expectedStdout: LONG_LINE + LONG_LINE },
  ],
};
