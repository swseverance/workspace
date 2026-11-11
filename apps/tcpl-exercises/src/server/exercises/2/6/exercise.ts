import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_6: ExerciseSource = {
  id: '2-6',
  chapter: 2,
  number: 6,
  title: 'Set bits from another value',
  summary:
    'Set the n bits of x that begin at position p to the rightmost n bits of y. K&R exercise 2-6, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '0cd0e341', expectedStdout: '' },
    // Setting bits 4 to 2 of 0.
    { id: '45488ad7', stdin: '0 4 3 7\n', expectedStdout: '28\n' },
    // Clearing bits 4 to 2 of 255.
    { id: '5e49203c', stdin: '255 4 3 0\n', expectedStdout: '227\n' },
    // Only the rightmost n bits of y are used.
    { id: 'fe61af3b', stdin: '0 3 2 255\n', expectedStdout: '12\n' },
    // A mix of bits, with the others left as they were.
    { id: '17910bd5', stdin: '170 5 4 5\n', expectedStdout: '150\n' },
    // A field ending at bit 0.
    { id: '51bcbc28', stdin: '0 3 4 9\n', expectedStdout: '9\n' },
    // A single bit at position 0.
    { id: 'a14649e6', stdin: '1 0 1 0\n', expectedStdout: '0\n' },
    // The top bit.
    { id: 'ef813b35', stdin: '0 31 1 1\n', expectedStdout: '2147483648\n' },
    // Clearing the top 8 bits of all ones.
    {
      id: 'fe539813',
      stdin: '4294967295 31 8 0\n',
      expectedStdout: '16777215\n',
    },
    // A 31-bit field.
    {
      id: 'a339bd78',
      stdin: '4294967295 30 31 0\n',
      expectedStdout: '2147483648\n',
    },
    // Several lines, the last with no newline.
    {
      id: '26510a73',
      stdin: '0 4 3 7\n255 4 3 0',
      expectedStdout: '28\n227\n',
    },
    // Setting each single bit of 0.
    {
      id: 'a3d6c9c6',
      stdin: Array.from({ length: 32 }, (_, p) => `0 ${p} 1 1\n`).join(''),
      expectedStdout: Array.from({ length: 32 }, (_, p) => `${2 ** p}\n`).join(
        '',
      ),
    },
    // Clearing each single bit of all ones.
    {
      id: 'f427211f',
      stdin: Array.from({ length: 32 }, (_, p) => `4294967295 ${p} 1 0\n`).join(
        '',
      ),
      expectedStdout: Array.from(
        { length: 32 },
        (_, p) => `${2 ** 32 - 1 - 2 ** p}\n`,
      ).join(''),
    },
  ],
};
