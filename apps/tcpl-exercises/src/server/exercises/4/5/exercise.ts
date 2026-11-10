import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_5: ExerciseSource = {
  id: '4-5',
  chapter: 4,
  number: 5,
  title: 'Calculator: sin, exp and pow',
  summary:
    'Give the reverse Polish calculator access to the library functions sin, exp and pow. K&R exercise 4-5, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: 'a69babce', expectedStdout: '' },
    // sin.
    {
      id: '5e96703a',
      stdin: '0 sin\n1 sin\n',
      expectedStdout: '\t0\n\t0.84147098\n',
    },
    // exp.
    {
      id: '179268ec',
      stdin: '0 exp\n1 exp\n',
      expectedStdout: '\t1\n\t2.7182818\n',
    },
    // pow, including a zero power.
    {
      id: '74d24e56',
      stdin: '2 10 pow\n10 0 pow\n',
      expectedStdout: '\t1024\n\t1\n',
    },
    // pow with a fractional power.
    {
      id: '8c625fb1',
      stdin: '2 0.5 pow\n4 0.5 pow\n',
      expectedStdout: '\t1.4142136\n\t2\n',
    },
    // pow raises the second element to the power of the top one.
    {
      id: 'f314d15d',
      stdin: '3 2 pow\n2 3 pow\n',
      expectedStdout: '\t9\n\t8\n',
    },
    // A function's result in more arithmetic.
    { id: 'f6ad2c4e', stdin: '1 exp 2 *\n', expectedStdout: '\t5.4365637\n' },
    // Arithmetic before a function: sin of pi/2.
    { id: 'e348be26', stdin: '3.14159265 2 / sin\n', expectedStdout: '\t1\n' },
    // A large result.
    { id: '8b47a41d', stdin: '100 exp\n', expectedStdout: '\t2.6881171e+43\n' },
    // A name straight after a number.
    { id: '2fedb47a', stdin: '0exp\n', expectedStdout: '\t1\n' },
    // An unknown name is reported whole.
    {
      id: 'a58e434f',
      stdin: '1 foo\n',
      expectedStdout: 'error: unknown command foo\n\t1\n',
    },
    // A name at the very end of the input; nothing prints without a
    // newline.
    { id: '8c7119c9', stdin: '1 exp\n0 exp', expectedStdout: '\t2.7182818\n' },
  ],
};
