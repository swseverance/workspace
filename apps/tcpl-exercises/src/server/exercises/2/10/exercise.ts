import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Every printable ASCII character, from the blank to the tilde.
const PRINTABLE = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i),
).join('');

export const exercise2_10: ExerciseSource = {
  id: '2-10',
  chapter: 2,
  number: 10,
  title: 'Lower case with a conditional expression',
  summary:
    'Convert upper case letters to lower case using a conditional expression instead of if-else. K&R exercise 2-10, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '41419c1e', expectedStdout: '' },
    // Mixed case.
    {
      id: '5a745b53',
      stdin: 'Hello, World!\n',
      expectedStdout: 'hello, world!\n',
    },
    // All upper case.
    { id: '17f1cb58', stdin: 'ABCXYZ\n', expectedStdout: 'abcxyz\n' },
    // Already lower case.
    { id: '6ee966f0', stdin: 'abcxyz\n', expectedStdout: 'abcxyz\n' },
    // Digits, punctuation, blanks and tabs are unchanged.
    {
      id: 'cae0da32',
      stdin: '0 9\t+-*/ (){}\n',
      expectedStdout: '0 9\t+-*/ (){}\n',
    },
    // The characters either side of A-Z and a-z in ASCII.
    { id: '6ada8c7c', stdin: '@A Z[ `a z{\n', expectedStdout: '@a z[ `a z{\n' },
    // Several lines, including a blank one.
    {
      id: '6c9d7465',
      stdin: 'ONE\n\nTwo\n',
      expectedStdout: 'one\n\ntwo\n',
    },
    // A last line with no newline.
    { id: '4416010a', stdin: 'END', expectedStdout: 'end' },
    // Non-ASCII characters pass through untouched.
    {
      id: 'f00623df',
      stdin: 'ÉTÉ Über\n',
      expectedStdout: 'ÉtÉ Über\n',
    },
    // Every printable ASCII character, 50 times over.
    {
      id: 'd956a7e1',
      stdin: (PRINTABLE + '\n').repeat(50),
      expectedStdout: (
        PRINTABLE.replace(/[A-Z]/g, (ch) => ch.toLowerCase()) + '\n'
      ).repeat(50),
    },
  ],
};
