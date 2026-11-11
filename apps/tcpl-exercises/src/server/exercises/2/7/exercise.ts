import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_7: ExerciseSource = {
  id: '2-7',
  chapter: 2,
  number: 7,
  title: 'Invert bits',
  summary:
    'Invert the n bits of x that begin at position p, leaving the other bits unchanged. K&R exercise 2-7, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'bbebc9de', expectedStdout: '' },
    // Bits 4 to 2 of 0.
    { id: 'b83c2edb', stdin: '0 4 3\n', expectedStdout: '28\n' },
    // Bits 4 to 2 of 255.
    { id: 'e52c3a3d', stdin: '255 4 3\n', expectedStdout: '227\n' },
    // A mix of bits, with the others left as they were.
    { id: '54ac0d98', stdin: '170 5 4\n', expectedStdout: '150\n' },
    // Bit 0, both ways.
    { id: 'e2f7306e', stdin: '0 0 1\n1 0 1\n', expectedStdout: '1\n0\n' },
    // The low 16 bits.
    { id: '95d460f7', stdin: '12345 15 16\n', expectedStdout: '53190\n' },
    // The top bit.
    { id: 'a4af28e7', stdin: '0 31 1\n', expectedStdout: '2147483648\n' },
    // The top 8 bits of all ones.
    {
      id: 'e5a45481',
      stdin: '4294967295 31 8\n',
      expectedStdout: '16777215\n',
    },
    // Inverting twice gives back x.
    {
      id: '5d0c762e',
      stdin: '150 5 4\n',
      expectedStdout: '170\n',
    },
    // Several lines, the last with no newline.
    {
      id: '2c55a9fc',
      stdin: '0 4 3\n255 4 3',
      expectedStdout: '28\n227\n',
    },
    // The low p+1 bits of 0, for each p up to 30.
    {
      id: '302ec15b',
      stdin: Array.from({ length: 31 }, (_, p) => `0 ${p} ${p + 1}\n`).join(''),
      expectedStdout: Array.from(
        { length: 31 },
        (_, p) => `${2 ** (p + 1) - 1}\n`,
      ).join(''),
    },
    // Each single bit of all ones.
    {
      id: 'e71ab10d',
      stdin: Array.from({ length: 32 }, (_, p) => `4294967295 ${p} 1\n`).join(
        '',
      ),
      expectedStdout: Array.from(
        { length: 32 },
        (_, p) => `${2 ** 32 - 1 - 2 ** p}\n`,
      ).join(''),
    },
  ],
};
