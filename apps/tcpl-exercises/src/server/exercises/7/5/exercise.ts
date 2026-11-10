import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../../4/calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise7_5: ExerciseSource = {
  id: '7-5',
  chapter: 7,
  number: 5,
  title: 'Calculator with scanf',
  summary:
    'Rewrite the reverse Polish calculator of Chapter 4 to read its input with scanf and sscanf. K&R exercise 7-5, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: '1bc3d580', expectedStdout: '' },
    // The book's example.
    { id: 'fe1fb1c2', stdin: '1 2 - 4 5 + *\n', expectedStdout: '\t-9\n' },
    // Numbers with a decimal point, with and without an integer part.
    { id: '0349a838', stdin: '1.5 .25 +\n', expectedStdout: '\t1.75\n' },
    // - and / take their operands in order.
    {
      id: '2b41d780',
      stdin: '10 4 -\n1 4 /\n',
      expectedStdout: '\t6\n\t0.25\n',
    },
    // Several lines.
    { id: '3c37a35a', stdin: '1 2 +\n3 4 *\n', expectedStdout: '\t3\n\t12\n' },
    // Blanks and tabs between operands.
    { id: 'be9ee755', stdin: ' \t1  2\t+ \n', expectedStdout: '\t3\n' },
    // Eight significant digits.
    {
      id: '45d87185',
      stdin: '1 3 /\n100000000 10 *\n',
      expectedStdout: '\t0.33333333\n\t1e+09\n',
    },
    // A zero divisor leaves the left operand on the stack.
    {
      id: '3ef6e3f9',
      stdin: '1 0 /\n',
      expectedStdout: 'error: zero divisor\n\t1\n',
    },
    // An unknown command.
    {
      id: 'f6938a5e',
      stdin: '1 2 ^\n',
      expectedStdout: 'error: unknown command ^\n\t2\n',
    },
    // Popping an empty stack.
    {
      id: '380057ae',
      stdin: '+\n',
      expectedStdout: 'error: stack empty\nerror: stack empty\n\t0\n',
    },
    // A blank line pops too.
    {
      id: '77f6afc0',
      stdin: '\n',
      expectedStdout: 'error: stack empty\n\t0\n',
    },
    // A last line with no newline prints nothing.
    { id: '805e1e7c', stdin: '1 2 +\n3 4', expectedStdout: '\t3\n' },
    // A 1000-character line of 249 additions.
    {
      id: '077c8f33',
      stdin: '1' + ' 1 +'.repeat(249) + '   \n',
      expectedStdout: '\t250\n',
    },
  ],
};
