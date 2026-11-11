import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_9: ExerciseSource = {
  id: '2-9',
  chapter: 2,
  number: 9,
  title: 'Faster bit count',
  summary:
    'Count the 1-bits in an integer faster, using x &= (x-1) to delete the rightmost 1-bit. K&R exercise 2-9, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '9ef59b0d', expectedStdout: '' },
    // Zero has no 1-bits.
    { id: 'e7b9821e', stdin: '0\n', expectedStdout: '0\n' },
    // One bit.
    { id: 'd7d47c31', stdin: '1\n8\n', expectedStdout: '1\n1\n' },
    // Several bits together.
    { id: '51ea123c', stdin: '7\n255\n', expectedStdout: '3\n8\n' },
    // Bits spread out: 0x3039.
    { id: '62ea2ef6', stdin: '12345\n', expectedStdout: '6\n' },
    // Alternating bits: 0xAAAAAAAA.
    { id: 'c16a0efa', stdin: '2863311530\n', expectedStdout: '16\n' },
    // The top bit alone.
    { id: '2a026618', stdin: '2147483648\n', expectedStdout: '1\n' },
    // All 32 bits.
    { id: '3a28fd2b', stdin: '4294967295\n', expectedStdout: '32\n' },
    // A last line with no newline.
    { id: 'dd0b41df', stdin: '3\n15', expectedStdout: '2\n4\n' },
    // Each power of 2.
    {
      id: 'e529b78e',
      stdin: Array.from({ length: 32 }, (_, k) => `${2 ** k}\n`).join(''),
      expectedStdout: '1\n'.repeat(32),
    },
    // 0 to 1023.
    {
      id: '47d9b0a5',
      stdin: Array.from({ length: 1024 }, (_, i) => `${i}\n`).join(''),
      expectedStdout: Array.from(
        { length: 1024 },
        (_, i) => `${[...i.toString(2)].filter((bit) => bit === '1').length}\n`,
      ).join(''),
    },
  ],
};
