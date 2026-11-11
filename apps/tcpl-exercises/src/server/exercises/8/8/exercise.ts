import { ExerciseSource } from '../../../../models/exercise';
import allocator from '../allocator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise8_8: ExerciseSource = {
  id: '8-8',
  chapter: 8,
  number: 8,
  title: 'Free any block with bfree',
  summary:
    "Write bfree, which adds any block of memory, such as a static array, to the book's allocator. K&R exercise 8-8, solved and tested in your browser.",
  description: `${description}\n${allocator}`,
  solution,
  tests: [
    // Empty input.
    { id: '3aff4929', expectedStdout: '' },
    // Without bfree, memory comes from the system.
    { id: 'bfc003ae', stdin: 'malloc 10\n', expectedStdout: 'heap\n' },
    // After bfree, from the array.
    {
      id: 'f2e97ec5',
      stdin: 'bfree 0 1000\nmalloc 100\n',
      expectedStdout: 'arena\n',
    },
    // A request too big for the array.
    {
      id: 'c6c94602',
      stdin: 'bfree 0 1000\nmalloc 2000\n',
      expectedStdout: 'heap\n',
    },
    // The array fills up.
    {
      id: '5b37fd2c',
      stdin: 'bfree 0 1000\nmalloc 400\nmalloc 400\nmalloc 400\n',
      expectedStdout: 'arena\narena\nheap\n',
    },
    // A block that doesn't start on an aligned address.
    {
      id: '9cdf9a51',
      stdin: 'bfree 1 999\nmalloc 100\n',
      expectedStdout: 'arena\n',
    },
    // A block too small to use is ignored.
    {
      id: '69629576',
      stdin: 'bfree 0 4\nmalloc 1\n',
      expectedStdout: 'heap\n',
    },
    // Two separate blocks.
    {
      id: 'e3bf9de3',
      stdin:
        'bfree 0 500\nbfree 5000 500\nmalloc 300\nmalloc 300\nmalloc 300\n',
      expectedStdout: 'arena\narena\nheap\n',
    },
    // A freed block from the array can be used again.
    {
      id: '7319de9c',
      stdin: 'bfree 0 1000\nmalloc 600\nfree\nmalloc 600\n',
      expectedStdout: 'arena\narena\n',
    },
    // A last line with no newline.
    {
      id: '555326d8',
      stdin: 'bfree 0 1000\nmalloc 10',
      expectedStdout: 'arena\n',
    },
    // 100 small blocks from the whole array, then one too big for what's
    // left.
    {
      id: 'd300d9ae',
      stdin: 'bfree 0 10000\n' + 'malloc 50\n'.repeat(100) + 'malloc 5000\n',
      expectedStdout: 'arena\n'.repeat(100) + 'heap\n',
    },
  ],
};
