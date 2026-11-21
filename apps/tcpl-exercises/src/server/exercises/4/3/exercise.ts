import { ExerciseSource } from '../../../../models/exercise';
import { seededRandom } from '../../utils';
import { runCalculator } from '../calculator';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// This exercise's calculator has negative numbers and %. The expected output
// of the generated stress tests below is computed by runCalculator and checked
// against the real main.c by test-exercises, so any drift is caught.
const OPTS = { negativeNumbers: true, modulus: true };
const OPS = ['+', '-', '*', '%'] as const;

const nextRandom = seededRandom(4030);
const pick = <T>(values: readonly T[]): T =>
  values[nextRandom() % values.length];

/** A small signed operand: an integer 0-12 or a two-decimal fraction. */
function operand(): string {
  const sign = nextRandom() % 3 === 0 ? '-' : '';
  const whole = nextRandom() % 13;
  if (nextRandom() % 2 === 0) return `${sign}${whole}`;
  return `${sign}${whole}.${String(nextRandom() % 100).padStart(2, '0')}`;
}

/** A balanced postfix expression: `leaves` operands, `leaves - 1` operators. */
function expression(leaves: number): string {
  if (leaves <= 1) return operand();
  const left = 1 + (nextRandom() % (leaves - 1));
  return `${expression(left)} ${expression(leaves - left)} ${pick(OPS)}`;
}

// 250 balanced expressions mixing + - * % over signed integers and decimals:
// stress for tokenising negatives, fmod's sign, and %.8g formatting.
const STRESS =
  Array.from({ length: 250 }, () => expression(1 + (nextRandom() % 5))).join(
    '\n',
  ) + '\n';

// 150 `a b %` lines over signed operands (some zero divisors): concentrates on
// the remainder's sign and the zero-divisor message.
const MOD_STRESS =
  Array.from({ length: 150 }, () => `${operand()} ${operand()} %`).join('\n') +
  '\n';

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
    // %.8g keeps up to eight significant digits, more than %g's default six.
    { id: '615a8abe', stdin: '1.2345678\n', expectedStdout: '\t1.2345678\n' },
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
    // Division by zero is reported the same way, leaving the dividend.
    {
      id: '2b760bdd',
      stdin: '5 0 /\n',
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
    // Stress: 250 random balanced expressions over + - * %.
    {
      id: '114f7d65',
      stdin: STRESS,
      expectedStdout: runCalculator(STRESS, OPTS),
    },
    // Stress: 150 random `a b %` lines (fmod's sign, zero divisors).
    {
      id: 'e9880563',
      stdin: MOD_STRESS,
      expectedStdout: runCalculator(MOD_STRESS, OPTS),
    },
  ],
};
