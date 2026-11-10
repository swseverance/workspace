import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_22: ExerciseSource = {
  id: '1-22',
  chapter: 1,
  number: 22,
  title: 'Fold long lines',
  summary:
    'Fold long input lines into shorter ones, breaking after the last word that fits. K&R exercise 1-22, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '8a6b8e1e', expectedStdout: '' },
    // A short line.
    { id: 'bc6b6a3e', stdin: 'hello world\n', expectedStdout: 'hello world\n' },
    // Exactly 20 characters.
    {
      id: 'f34785cc',
      stdin: 'aaaaaaaaaaaaaaaaaaaa\n',
      expectedStdout: 'aaaaaaaaaaaaaaaaaaaa\n',
    },
    // 21 characters, two words.
    {
      id: '5c63fed3',
      stdin: 'aaaaaaaaaa bbbbbbbbbb\n',
      expectedStdout: 'aaaaaaaaaa\nbbbbbbbbbb\n',
    },
    // Several breaks.
    {
      id: '04365761',
      stdin: 'the quick brown fox jumps over the lazy dog\n',
      expectedStdout: 'the quick brown fox\njumps over the lazy\ndog\n',
    },
    // A blank right after column 20.
    {
      id: '0311d560',
      stdin: 'aaaaaaaaaaaaaaaaaaaa bbbbb\n',
      expectedStdout: 'aaaaaaaaaaaaaaaaaaaa\nbbbbb\n',
    },
    // Several blanks at a break are dropped.
    {
      id: 'da254159',
      stdin: 'aaaaaaaaaa     bbbbbbbbbbbb\n',
      expectedStdout: 'aaaaaaaaaa\nbbbbbbbbbbbb\n',
    },
    // No blanks: break after 20 characters.
    {
      id: '1dda31d8',
      stdin: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n',
      expectedStdout: 'xxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxx\nxxxxx\n',
    },
    // A tab is a break point too.
    {
      id: 'bbd103ff',
      stdin: 'aaaaaaaaaaaa\tbbbbbbbbbbbb\n',
      expectedStdout: 'aaaaaaaaaaaa\nbbbbbbbbbbbb\n',
    },
    // A word longer than 20 characters after a short one.
    {
      id: 'adcb0419',
      stdin: 'ab cccccccccccccccccccccccccccccc\n',
      expectedStdout: 'ab\ncccccccccccccccccccc\ncccccccccc\n',
    },
    // Short and empty lines stay as they are.
    {
      id: 'c8d60792',
      stdin: 'short\n\naaaaaaaaaa bbbbbbbbbb\n',
      expectedStdout: 'short\n\naaaaaaaaaa\nbbbbbbbbbb\n',
    },
    // No final newline.
    {
      id: '99707666',
      stdin: 'aaaaaaaaaa bbbbbbbbbb',
      expectedStdout: 'aaaaaaaaaa\nbbbbbbbbbb',
    },
    // A 2,000-character line of words.
    {
      id: '95499861',
      stdin: 'word '.repeat(399) + 'word\n',
      expectedStdout: 'word word word word\n'.repeat(100),
    },
    // A 1,000-character word.
    {
      id: '9a85977e',
      stdin: 'x'.repeat(1000) + '\n',
      expectedStdout: ('x'.repeat(20) + '\n').repeat(50),
    },
  ],
};
