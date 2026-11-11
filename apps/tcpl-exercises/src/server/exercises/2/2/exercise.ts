import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_2: ExerciseSource = {
  id: '2-2',
  chapter: 2,
  number: 2,
  title: 'Loop without && or ||',
  summary:
    "Rewrite getline's input loop without using the && or || operators. K&R exercise 2-2, solved and tested in your browser.",
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'fe4afc8d', expectedStdout: '' },
    // One line.
    { id: 'aa4960d7', stdin: 'hello\n', expectedStdout: '6: hello\n' },
    // Several lines.
    { id: 'f02f97d2', stdin: 'a\nbc\n', expectedStdout: '2: a\n3: bc\n' },
    // A blank line.
    { id: '2da0bbda', stdin: 'x\n\ny\n', expectedStdout: '2: x\n1: \n2: y\n' },
    // A last line with no newline.
    { id: '2f2d43ee', stdin: 'abc', expectedStdout: '3: abc\n' },
    // Blanks and tabs are kept.
    { id: '4cefced1', stdin: ' \t a \n', expectedStdout: '6:  \t a \n' },
    // 998 characters and a newline just fit.
    {
      id: 'ba212309',
      stdin: 'x'.repeat(998) + '\n',
      expectedStdout: '999: ' + 'x'.repeat(998) + '\n',
    },
    // 999 characters fill the array; the newline comes on the next call.
    {
      id: 'dcc880e3',
      stdin: 'x'.repeat(999) + '\n',
      expectedStdout: '999: ' + 'x'.repeat(999) + '\n' + '1: \n',
    },
    // A full array with no newline after it.
    {
      id: '15edda3b',
      stdin: 'x'.repeat(999),
      expectedStdout: '999: ' + 'x'.repeat(999) + '\n',
    },
    // A long line is split without losing a character.
    {
      id: '9f3423ab',
      stdin: 'a'.repeat(999) + 'b'.repeat(501) + '\n',
      expectedStdout:
        '999: ' + 'a'.repeat(999) + '\n' + '502: ' + 'b'.repeat(501) + '\n',
    },
    // A 2,000-character line with no newline.
    {
      id: '0f59de29',
      stdin: 'a'.repeat(999) + 'b'.repeat(999) + 'cc',
      expectedStdout:
        '999: ' +
        'a'.repeat(999) +
        '\n' +
        '999: ' +
        'b'.repeat(999) +
        '\n' +
        '2: cc\n',
    },
    // 1,000 short lines.
    {
      id: 'e92ac1cc',
      stdin: 'ab\n'.repeat(1000),
      expectedStdout: '3: ab\n'.repeat(1000),
    },
  ],
};
