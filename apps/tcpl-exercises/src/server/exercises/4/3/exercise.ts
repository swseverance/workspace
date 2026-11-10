import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_3: ExerciseSource = {
  id: '4-3',
  chapter: 4,
  number: 3,
  title: 'Calculator: modulus and negative numbers',
  summary:
    'Extend the reverse Polish calculator with a % operator and negative numbers. K&R exercise 4-3, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: '4fb25eed', expectedStdout: '' },
    // Remainders of whole numbers, and % in a longer expression.
    {
      id: 'f2b99364',
      stdin: '7 3 %\n10 4 % 3 *\n',
      expectedStdout: '\t1\n\t6\n',
    },
    // A remainder with a fraction.
    { id: '52c46def', stdin: '7.5 2 %\n', expectedStdout: '\t1.5\n' },
    // The remainder has the sign of the left operand.
    {
      id: '99128ce2',
      stdin: '-7 3 %\n7 -3 %\n',
      expectedStdout: '\t-1\n\t1\n',
    },
    // A zero divisor leaves the left operand on the stack.
    {
      id: 'ae7c02bb',
      stdin: '5 0 %\n',
      expectedStdout: 'error: zero divisor\n\t5\n',
    },
    // Negative numbers, with and without an integer part.
    {
      id: 'a747023a',
      stdin: '-5\n-2.5 -0.5 *\n-.5 1 +\n',
      expectedStdout: '\t-5\n\t1.25\n\t0.5\n',
    },
    // The book's example: - followed by a blank is subtraction.
    { id: '5786c7a1', stdin: '1 2 - 4 5 + *\n', expectedStdout: '\t-9\n' },
    // Subtracting a negative number.
    { id: '6f9d61cf', stdin: '10 -2 -\n', expectedStdout: '\t12\n' },
    // - followed by a newline is subtraction.
    { id: '26f97f27', stdin: '5 3-\n', expectedStdout: '\t2\n' },
    // - at the very end of the input is subtraction; nothing prints
    // without a newline.
    { id: '7507b5ac', stdin: '4 1 -\n9 5 -', expectedStdout: '\t3\n' },
    // 200 subtractions of -1.
    {
      id: '10f417d5',
      stdin: '1 ' + '-1 - '.repeat(200) + '\n',
      expectedStdout: '\t201\n',
    },
  ],
};
