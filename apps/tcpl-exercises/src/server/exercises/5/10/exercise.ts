import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 1 to 100 fill the stack exactly; 99 additions sum them.
const FULL_STACK = [
  ...Array.from({ length: 100 }, (_, i) => `${i + 1}`),
  ...Array<string>(99).fill('+'),
];

// 1, then 999 additions of 1.
const LONG_CHAIN = [
  '1',
  ...Array.from({ length: 999 }, () => ['1', '+']).flat(),
];

export const exercise5_10: ExerciseSource = {
  id: '5-10',
  chapter: 5,
  number: 10,
  title: 'expr: a reverse Polish expression from the command line',
  summary:
    'Write expr, which evaluates a reverse Polish expression from the command line, such as expr 2 3 4 + *. K&R exercise 5-10, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The book's example.
    { id: '0574ac0d', args: ['2', '3', '4', '+', '*'], expectedStdout: '14\n' },
    // A single number.
    { id: 'cbbf4025', args: ['5'], expectedStdout: '5\n' },
    // - and / take their operands in order.
    {
      id: '30ab1e30',
      args: ['10', '4', '-', '1', '4', '/', '*'],
      expectedStdout: '1.5\n',
    },
    // Negative numbers and fractions.
    {
      id: '3cb0fa1b',
      args: ['2.5', '-1.5', '*', '.5', '+'],
      expectedStdout: '-3.25\n',
    },
    // Eight significant digits.
    { id: '77899967', args: ['1', '3', '/'], expectedStdout: '0.33333333\n' },
    // A longer expression.
    {
      id: '2222bea3',
      args: ['1', '2', '+', '3', '4', '+', '*', '5', '-'],
      expectedStdout: '16\n',
    },
    // No arguments.
    { id: '7b8be719', expectedStdout: 'error\n' },
    // An operator with too few operands.
    { id: 'deadb3a1', args: ['1', '+'], expectedStdout: 'error\n' },
    // More than one value left.
    { id: '98a1ee1b', args: ['1', '2'], expectedStdout: 'error\n' },
    // An unknown operator, and something that isn't a number.
    { id: '5e886dbb', args: ['2', '3', 'x'], expectedStdout: 'error\n' },
    { id: 'db764e1c', args: ['2', '3x', '+'], expectedStdout: 'error\n' },
    // Division by zero.
    { id: 'a5351dbc', args: ['1', '0', '/'], expectedStdout: 'error\n' },
    // 100 values on the stack at once.
    { id: '2cf4ea99', args: FULL_STACK, expectedStdout: '5050\n' },
    // 1999 arguments.
    { id: 'abab5890', args: LONG_CHAIN, expectedStdout: '1000\n' },
  ],
};
