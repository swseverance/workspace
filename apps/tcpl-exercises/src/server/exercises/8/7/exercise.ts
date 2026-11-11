import { ExerciseSource } from '../../../../models/exercise';
import allocator from '../allocator.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const BAD = 'kr_free: bad pointer\n';

// 1000 blocks of 1 to 1000 bytes, all freed newest first, then one freed
// again.
const COUNT = Array.from({ length: 1000 }, (_, i) => i);
const MANY_IN =
  COUNT.map((i) => `malloc ${i + 1}\n`).join('') +
  [...COUNT]
    .reverse()
    .map((i) => `free ${i}\n`)
    .join('') +
  'free 500\n';
const MANY_OUT = COUNT.map((i) => `${i}\n`).join('') + BAD;

export const exercise8_7: ExerciseSource = {
  id: '8-7',
  chapter: 8,
  number: 7,
  title: 'malloc and free with error checking',
  summary:
    "Make the book's storage allocator check for implausible sizes and frees of bad or already-freed blocks. K&R exercise 8-7, solved and tested in your browser.",
  description: `${description}\n${allocator}`,
  solution,
  tests: [
    // Empty input.
    { id: 'a9f38813', expectedStdout: '' },
    // A block allocated and freed.
    { id: '07e40833', stdin: 'malloc 10\nfree 0\n', expectedStdout: '0\n' },
    // Sizes kr_malloc refuses, and the largest it accepts.
    {
      id: '8a38a62c',
      stdin: 'malloc 0\nmalloc 1000001\nmalloc 1000000\n',
      expectedStdout: 'NULL\nNULL\n2\n',
    },
    // Freeing NULL does nothing.
    { id: 'a3de13f6', stdin: 'malloc 0\nfree 0\n', expectedStdout: 'NULL\n' },
    // A static array, before anything is allocated and after.
    {
      id: '393b7b71',
      stdin: 'free static\nmalloc 10\nfree static\n',
      expectedStdout: BAD + '0\n' + BAD,
    },
    // An address inside a block.
    {
      id: '0ada4da8',
      stdin: 'malloc 100\nfree 0 +32\n',
      expectedStdout: '0\n' + BAD,
    },
    // The same block freed twice.
    {
      id: 'b86cc085',
      stdin: 'malloc 10\nfree 0\nfree 0\n',
      expectedStdout: '0\n' + BAD,
    },
    // Freed twice after joining a free neighbour.
    {
      id: 'bde6a81d',
      stdin: 'malloc 10\nmalloc 10\nfree 0\nfree 1\nfree 0\nfree 1\n',
      expectedStdout: '0\n1\n' + BAD + BAD,
    },
    // Allocating and freeing still work after errors.
    {
      id: '152f9615',
      stdin:
        'free static\nmalloc 20\nmalloc 30\nfree 1\nfree 0\nmalloc 40\nfree 2\n',
      expectedStdout: BAD + '0\n1\n2\n',
    },
    // A last line with no newline.
    { id: 'a5ce1c83', stdin: 'malloc 5\nfree 0', expectedStdout: '0\n' },
    // 1000 blocks freed, then one freed again.
    { id: 'e9af9235', stdin: MANY_IN, expectedStdout: MANY_OUT },
  ],
};
