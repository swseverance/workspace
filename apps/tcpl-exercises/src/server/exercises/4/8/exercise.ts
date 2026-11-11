import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_8: ExerciseSource = {
  id: '4-8',
  chapter: 4,
  number: 8,
  title: 'One character of pushback',
  summary:
    'Rewrite getch and ungetch for at most one character of pushback, and use them in the calculator. K&R exercise 4-8, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: 'd68092e0', expectedStdout: '' },
    // The book's example.
    { id: '96d3e0c8', stdin: '1 2 - 4 5 + *\n', expectedStdout: '\t-9\n' },
    // Operators straight after numbers.
    { id: '90632fff', stdin: '3 4*5+\n', expectedStdout: '\t17\n' },
    // A newline straight after a number.
    { id: 'fb49e33d', stdin: '42\n', expectedStdout: '\t42\n' },
    // Numbers with a decimal point, with and without an integer part.
    { id: '7c7d8cc2', stdin: '1.5 .25 +\n', expectedStdout: '\t1.75\n' },
    // Several lines.
    { id: 'df35b284', stdin: '1 2 +\n3 4 *\n', expectedStdout: '\t3\n\t12\n' },
    // Blanks and tabs between operands.
    { id: 'caac00dd', stdin: ' \t1  2\t+ \n', expectedStdout: '\t3\n' },
    // Eight significant digits.
    { id: '245c4559', stdin: '1 3 /\n', expectedStdout: '\t0.33333333\n' },
    // A zero divisor leaves the left operand on the stack.
    {
      id: '5e0a89bb',
      stdin: '1 0 /\n',
      expectedStdout: 'error: zero divisor\n\t1\n',
    },
    // An unknown command.
    {
      id: '94b0d1a3',
      stdin: '1 2 ^\n',
      expectedStdout: 'error: unknown command ^\n\t2\n',
    },
    // The input ends straight after a number; nothing prints without a
    // newline.
    { id: '83aa2934', stdin: '1 2 +\n3 4', expectedStdout: '\t3\n' },
    // 2000 additions, each operator straight after a number.
    {
      id: '01b52378',
      stdin: '1 ' + '1+'.repeat(2000) + '\n',
      expectedStdout: '\t2001\n',
    },
  ],
};
