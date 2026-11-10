import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_11: ExerciseSource = {
  id: '4-11',
  chapter: 4,
  number: 11,
  title: 'getop without ungetch',
  summary:
    "Rewrite the calculator's getop to work without ungetch, using an internal static variable. K&R exercise 4-11, solved and tested in your browser.",
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: '0cded0fa', expectedStdout: '' },
    // The book's example.
    { id: '49a04b5f', stdin: '1 2 - 4 5 + *\n', expectedStdout: '\t-9\n' },
    // Operators straight after numbers.
    { id: '2906607a', stdin: '3 4*5+\n', expectedStdout: '\t17\n' },
    // A newline straight after a number.
    { id: '0336677b', stdin: '42\n', expectedStdout: '\t42\n' },
    // Numbers with a decimal point, with and without an integer part.
    { id: 'e702c986', stdin: '1.5 .25 +\n', expectedStdout: '\t1.75\n' },
    // Several lines.
    { id: '477e668f', stdin: '1 2 +\n3 4 *\n', expectedStdout: '\t3\n\t12\n' },
    // Blanks and tabs between operands.
    { id: 'a3fbf493', stdin: ' \t1  2\t+ \n', expectedStdout: '\t3\n' },
    // Eight significant digits.
    { id: '1f931114', stdin: '1 3 /\n', expectedStdout: '\t0.33333333\n' },
    // A zero divisor leaves the left operand on the stack.
    {
      id: '95f8a95d',
      stdin: '1 0 /\n',
      expectedStdout: 'error: zero divisor\n\t1\n',
    },
    // An unknown command.
    {
      id: '01f5af91',
      stdin: '1 2 ^\n',
      expectedStdout: 'error: unknown command ^\n\t2\n',
    },
    // The input ends straight after a number; nothing prints without a
    // newline.
    { id: 'fc2fa473', stdin: '1 2 +\n3 4', expectedStdout: '\t3\n' },
    // 2000 additions, each operator straight after a number.
    {
      id: '50a05919',
      stdin: '1 ' + '1+'.repeat(2000) + '\n',
      expectedStdout: '\t2001\n',
    },
  ],
};
