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
    // A short line keeps its blanks, wherever they are.
    {
      id: 'a6a50db6',
      stdin: 'a  b  \n',
      expectedStdout: 'a  b  \n',
    },
    // A tab counts as one character: this line is 20 long.
    {
      id: '1b9cd0ce',
      stdin: 'aaaa\tbbbbbbbbbbbbbbb\n',
      expectedStdout: 'aaaa\tbbbbbbbbbbbbbbb\n',
    },
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
    // Blanks and tabs at a break are all dropped, even those past 20
    // characters.
    {
      id: 'b6202c81',
      stdin: 'aaaaaaaaaaaaaaaaaa \t \tbbb ccc\n',
      expectedStdout: 'aaaaaaaaaaaaaaaaaa\nbbb ccc\n',
    },
    // A break that leaves nothing prints no empty line.
    {
      id: '99a511b2',
      stdin: 'aaaaaaaaaaaaaaaaaaaa \n',
      expectedStdout: 'aaaaaaaaaaaaaaaaaaaa\n',
    },
    // The line after such a break keeps the blanks it starts with.
    {
      id: 'c4d44dc1',
      stdin: 'aaaaaaaaaaaaaaaaaaaa \n  b\n',
      expectedStdout: 'aaaaaaaaaaaaaaaaaaaa\n  b\n',
    },
    // The last piece keeps the blanks at its end.
    {
      id: '49163146',
      stdin: 'aaaaaaaaaa bbbbbbbbbb  \n',
      expectedStdout: 'aaaaaaaaaa\nbbbbbbbbbb  \n',
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
    // Blanks at the start of a line aren't a place to break.
    {
      id: 'f52b68b3',
      stdin: '  aaaaaaaaaaaaaaaaaaaaaa\n',
      expectedStdout: '  aaaaaaaaaaaaaaaaaa\naaaa\n',
    },
    // Tabs at the start of a line aren't a place to break either.
    {
      id: '51b4e95e',
      stdin: '\t\taaaaaaaaaaaaaaaaaaaaaa\n',
      expectedStdout: '\t\taaaaaaaaaaaaaaaaaa\naaaa\n',
    },
    // A long line of only blanks is cut like a long word.
    {
      id: 'ed17d2a6',
      stdin: ' '.repeat(25) + '\n',
      expectedStdout: ' '.repeat(20) + '\n' + ' '.repeat(5) + '\n',
    },
    // Short and empty lines stay as they are.
    {
      id: 'c8d60792',
      stdin: 'short\n\naaaaaaaaaa bbbbbbbbbb\n',
      expectedStdout: 'short\n\naaaaaaaaaa\nbbbbbbbbbb\n',
    },
    // An empty line after a folded line stays.
    {
      id: 'f758eec8',
      stdin: 'aaaaaaaaaa bbbbbbbbbb\n\nx\n',
      expectedStdout: 'aaaaaaaaaa\nbbbbbbbbbb\n\nx\n',
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
