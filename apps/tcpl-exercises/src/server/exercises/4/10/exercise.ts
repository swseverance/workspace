import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_10: ExerciseSource = {
  id: '4-10',
  chapter: 4,
  number: 10,
  title: 'Calculator reading whole lines',
  summary:
    'Revise the reverse Polish calculator to read whole lines with getline instead of using getch and ungetch. K&R exercise 4-10, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: '3c4126d7', expectedStdout: '' },
    // The book's example.
    { id: 'f7449ccf', stdin: '1 2 - 4 5 + *\n', expectedStdout: '\t-9\n' },
    // Operators straight after numbers.
    { id: '6b43b94c', stdin: '3 4*5+\n', expectedStdout: '\t17\n' },
    // A newline straight after a number.
    { id: '030b4940', stdin: '42\n', expectedStdout: '\t42\n' },
    // Numbers with a decimal point, with and without an integer part.
    { id: '4a9a44cc', stdin: '1.5 .25 +\n', expectedStdout: '\t1.75\n' },
    // Several lines.
    { id: '916b3eae', stdin: '1 2 +\n3 4 *\n', expectedStdout: '\t3\n\t12\n' },
    // Blanks and tabs between operands.
    { id: '1b447e3a', stdin: ' \t1  2\t+ \n', expectedStdout: '\t3\n' },
    // Eight significant digits.
    { id: '4ebce165', stdin: '1 3 /\n', expectedStdout: '\t0.33333333\n' },
    // A zero divisor leaves the left operand on the stack.
    {
      id: 'f43a35bf',
      stdin: '1 0 /\n',
      expectedStdout: 'error: zero divisor\n\t1\n',
    },
    // An unknown command.
    {
      id: '2ea45301',
      stdin: '1 2 ^\n',
      expectedStdout: 'error: unknown command ^\n\t2\n',
    },
    // The input ends straight after a number; nothing prints without a
    // newline.
    { id: 'af7f30f4', stdin: '1 2 +\n3 4', expectedStdout: '\t3\n' },
    // A 1000-character line of 249 additions.
    {
      id: 'dd566bb4',
      stdin: '1' + ' 1 +'.repeat(249) + '   \n',
      expectedStdout: '\t250\n',
    },
  ],
};
