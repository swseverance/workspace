import { ExerciseSource } from '../../../../models/exercise';
import { seededRandom } from '../../utils';
import { runCalculator } from '../calculator';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 1 to 100 fill the stack exactly.
const FULL_STACK = Array.from({ length: 100 }, (_, i) => i + 1).join(' ');

// The stress test's expected output is computed by runCalculator and checked
// against the real main.c by test-exercises, so any drift is caught there.
const OPTS = { stackCommands: true };
const BINOPS = ['+', '-', '*', '/'] as const;

const nextRandom = seededRandom(4040);
const pick = <T>(values: readonly T[]): T =>
  values[nextRandom() % values.length];

/**
 * A random line that only ever takes an action valid for the current stack
 * depth, so it exercises ? d s c and the operators thoroughly without leaning
 * on the error paths. Numbers are single digits, so values stay small.
 */
function randomLine(): string {
  let depth = 0;
  const tokens: string[] = [];
  const steps = 4 + (nextRandom() % 8);
  for (let i = 0; i < steps; i++) {
    const number = () => {
      tokens.push(String(nextRandom() % 10));
      depth++;
    };
    const actions: (() => void)[] = [number, number, number];
    if (depth >= 2) {
      actions.push(() => {
        tokens.push(pick(BINOPS));
        depth--;
      });
      actions.push(() => tokens.push('s'));
    }
    if (depth >= 1 && depth < 90) {
      actions.push(() => {
        tokens.push('d');
        depth++;
      });
    }
    if (depth >= 1) actions.push(() => tokens.push('?'));
    if (nextRandom() % 8 === 0) {
      actions.push(() => {
        tokens.push('c');
        depth = 0;
      });
    }
    pick(actions)();
  }
  return tokens.join(' ');
}

const STRESS = Array.from({ length: 250 }, randomLine).join('\n') + '\n';

export const exercise4_4: ExerciseSource = {
  id: '4-4',
  chapter: 4,
  number: 4,
  title: 'Calculator: print, duplicate, swap and clear',
  summary:
    'Add calculator commands to print the top of the stack, duplicate it, swap the top two and clear it. K&R exercise 4-4, solved and tested in your browser.',
  description: `${description}\n${calculator}`,
  solution,
  tests: [
    // Empty input.
    { id: '1a696a44', expectedStdout: '' },
    // ? prints the top, then the newline pops and prints it.
    { id: '40dbddc3', stdin: '3 ?\n', expectedStdout: '\t3\n\t3\n' },
    // ? leaves the stack as it was.
    { id: 'b10ab8c2', stdin: '1 2 ? +\n', expectedStdout: '\t2\n\t3\n' },
    // Duplicate.
    { id: 'fee15fd5', stdin: '3 d *\n', expectedStdout: '\t9\n' },
    // Swap, before - and /.
    {
      id: 'dce26ebf',
      stdin: '1 2 s -\n6 3 s /\n',
      expectedStdout: '\t1\n\t0.5\n',
    },
    // Swap leaves the elements below the top two alone.
    { id: '22481e85', stdin: '1 2 3 s - +\n', expectedStdout: '\t2\n' },
    // Clear, then carry on.
    { id: 'e79ecef4', stdin: '1 2 c 5\n', expectedStdout: '\t5\n' },
    // Clear leaves nothing for the newline to pop.
    {
      id: 'c0b0c51e',
      stdin: '1 2 c\n',
      expectedStdout: 'error: stack empty\n\t0\n',
    },
    // The commands together.
    {
      id: 'ae060be7',
      stdin: '1 2 s ? d ? + ?\n',
      expectedStdout: '\t1\n\t1\n\t2\n\t2\n',
    },
    // What's left on the stack carries over to the next line.
    { id: '91e7f2b3', stdin: '1 2\n?\n', expectedStdout: '\t2\n\t1\n\t1\n' },
    // ? prints even without a newline after it.
    { id: 'fe3ab9cf', stdin: '4 ?', expectedStdout: '\t4\n' },
    // Clear a full stack.
    { id: 'e2e7783a', stdin: `${FULL_STACK} c 7\n`, expectedStdout: '\t7\n' },
    // ? prints in the same format as a newline: up to eight significant digits.
    {
      id: '42d81e29',
      stdin: '1.2345678 ?\n',
      expectedStdout: '\t1.2345678\n\t1.2345678\n',
    },
    // ? on an empty stack reports it rather than reading past the stack.
    { id: 'e98ba9ee', stdin: '?', expectedStdout: 'error: stack empty\n' },
    // d on an empty stack reports it rather than duplicating nothing.
    { id: '0f123473', stdin: 'd', expectedStdout: 'error: stack empty\n' },
    // s with one element reports it rather than swapping past the stack.
    {
      id: 'e2947ed7',
      stdin: '1 s\n',
      expectedStdout: "error: can't swap, fewer than two elements\n\t1\n",
    },
    // d on a full stack goes through push, so it reports the stack as full.
    {
      id: 'e4a4bf54',
      stdin: `${FULL_STACK} d\n`,
      expectedStdout: "error: stack full, can't push 100\n\t100\n",
    },
    // Stress: 250 random stack-safe lines over the operators and ? d s c.
    {
      id: '50dc1954',
      stdin: STRESS,
      expectedStdout: runCalculator(STRESS, OPTS),
    },
  ],
};
