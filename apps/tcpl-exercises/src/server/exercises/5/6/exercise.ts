import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const LONG_LINE = Array.from({ length: 1000 }, (_, i) =>
  String.fromCharCode(33 + (i % 94)),
).join('');

export const exercise5_6: ExerciseSource = {
  id: '5-6',
  chapter: 5,
  number: 6,
  title: 'getline and reverse with pointers',
  summary:
    'Rewrite getline and reverse with pointers instead of array indexing, and print each line reversed. K&R exercise 5-6, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '77a4fecf', expectedStdout: '' },
    // Odd length.
    { id: 'd1fd4f3e', stdin: 'hello\n', expectedStdout: 'olleh\n' },
    // Even length.
    { id: '7f089f4a', stdin: 'abcd\nab\n', expectedStdout: 'dcba\nba\n' },
    // One character.
    { id: '3ea3487c', stdin: 'x\n', expectedStdout: 'x\n' },
    // A blank line between others.
    { id: 'eacb512f', stdin: 'ab\n\ncd\n', expectedStdout: 'ba\n\ndc\n' },
    // Blanks and tabs move too.
    { id: '0dc8684f', stdin: ' a\tb  \n', expectedStdout: '  b\ta \n' },
    // Several lines.
    {
      id: '9e59de0d',
      stdin: 'one\ntwo\nthree\n',
      expectedStdout: 'eno\nowt\neerht\n',
    },
    // A last line with no newline.
    { id: '15c76050', stdin: 'abc', expectedStdout: 'cba\n' },
    // A 1000-character line.
    {
      id: 'd1218eb5',
      stdin: LONG_LINE + '\n',
      expectedStdout: [...LONG_LINE].reverse().join('') + '\n',
    },
  ],
};
