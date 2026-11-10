import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const LONG_LINE = Array.from({ length: 1000 }, (_, i) =>
  String.fromCharCode(33 + (i % 94)),
).join('');

export const exercise4_13: ExerciseSource = {
  id: '4-13',
  chapter: 4,
  number: 13,
  title: 'Recursive reverse',
  summary:
    'Reverse a string in place with a recursive function. K&R exercise 4-13, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'c389bce3', expectedStdout: '' },
    // Odd length.
    { id: '69f5fe97', stdin: 'hello\n', expectedStdout: 'olleh\n' },
    // Even length.
    { id: 'bc485a01', stdin: 'abcd\nab\n', expectedStdout: 'dcba\nba\n' },
    // One character.
    { id: '99dca2dd', stdin: 'x\n', expectedStdout: 'x\n' },
    // A palindrome.
    { id: '75c869de', stdin: 'racecar\n', expectedStdout: 'racecar\n' },
    // A blank line between others.
    { id: 'e1fe3a68', stdin: 'ab\n\ncd\n', expectedStdout: 'ba\n\ndc\n' },
    // Blanks and tabs move too.
    { id: '43465ab9', stdin: ' a\tb  \n', expectedStdout: '  b\ta \n' },
    // Several lines.
    {
      id: '82b912e0',
      stdin: 'one\ntwo\nthree\n',
      expectedStdout: 'eno\nowt\neerht\n',
    },
    // A last line with no newline.
    { id: 'b0eb634c', stdin: 'abc', expectedStdout: 'cba\n' },
    // A 1000-character line.
    {
      id: 'da8ec2be',
      stdin: LONG_LINE + '\n',
      expectedStdout: [...LONG_LINE].reverse().join('') + '\n',
    },
  ],
};
