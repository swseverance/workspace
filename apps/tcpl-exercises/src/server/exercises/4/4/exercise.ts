import { ExerciseSource } from '../../../../models/exercise';
import calculator from '../calculator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 1 to 100 fill the stack exactly.
const FULL_STACK = Array.from({ length: 100 }, (_, i) => i + 1).join(' ');

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
  ],
};
