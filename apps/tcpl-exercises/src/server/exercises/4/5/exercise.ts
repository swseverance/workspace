import { ExerciseSource } from '../../../../models/exercise';
import { seededRandom } from '../../utils';
import { runCalculator } from '../calculator';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Stress for the word tokeniser and the unknown-command path, checked against
// the real main.c by test-exercises. It never emits sin/exp/pow: JS Math and
// C's libm can differ in the last printed digit, so function *values* can't be
// generated here (the existing tests cover those with hand-checked numbers).
const OPTS = { functions: true };
const BINOPS = ['+', '-', '*', '/'] as const;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const FUNCTIONS = new Set(['sin', 'exp', 'pow']);

const nextRandom = seededRandom(4050);
const pick = <T>(values: readonly T[]): T =>
  values[nextRandom() % values.length];

/** A lower-case word that is not sin/exp/pow, so no function value is printed. */
function unknownWord(): string {
  for (;;) {
    let word = '';
    const length = 1 + (nextRandom() % 5);
    for (let i = 0; i < length; i++) word += LETTERS[nextRandom() % 26];
    if (!FUNCTIONS.has(word)) return word;
  }
}

/**
 * A random stack-safe line of numbers, operators, unknown words (some glued
 * straight onto a number) and the odd upper-case letter, exercising the word
 * tokeniser and the unknown-command path without applying sin/exp/pow.
 */
function randomLine(): string {
  let depth = 0;
  const tokens: string[] = [];
  const steps = 4 + (nextRandom() % 8);
  for (let i = 0; i < steps; i++) {
    const number = () => {
      tokens.push(String(nextRandom() % 100));
      depth++;
    };
    const actions: (() => void)[] = [
      number,
      number,
      () => {
        tokens.push(String(nextRandom() % 100) + unknownWord()); // number then word
        depth++;
      },
      () => tokens.push(unknownWord()),
    ];
    if (depth >= 2) {
      actions.push(() => {
        tokens.push(pick(BINOPS));
        depth--;
      });
    }
    if (nextRandom() % 6 === 0) {
      actions.push(() => tokens.push(LETTERS[nextRandom() % 26].toUpperCase()));
    }
    pick(actions)();
  }
  return tokens.join(' ');
}

const STRESS = Array.from({ length: 250 }, randomLine).join('\n') + '\n';

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
    // A name is lower-case letters only: a digit ends the word and starts a
    // number, so `sin3` is `sin` then `3`.
    { id: '394a516d', stdin: '2 sin3\n', expectedStdout: '\t3\n' },
    // A name is lower-case letters only: an upper-case letter ends the word
    // and is its own unknown command, so `expA` is `exp` then `A`.
    {
      id: '55bd7953',
      stdin: '2 expA\n',
      expectedStdout: 'error: unknown command A\n\t7.3890561\n',
    },
    // An unknown name is reported whole.
    {
      id: 'a58e434f',
      stdin: '1 foo\n',
      expectedStdout: 'error: unknown command foo\n\t1\n',
    },
    // A name at the very end of the input; nothing prints without a
    // newline.
    { id: '8c7119c9', stdin: '1 exp\n0 exp', expectedStdout: '\t2.7182818\n' },
    // Stress: random lines of numbers, operators and unknown words (the word
    // tokeniser and unknown-command path; no sin/exp/pow values).
    {
      id: '2372c84c',
      stdin: STRESS,
      expectedStdout: runCalculator(STRESS, OPTS),
    },
  ],
};
