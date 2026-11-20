import { ExerciseSource } from '../../../../models/exercise';
import { lines, seededRandom } from '../../utils';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Every integer from -500 to 500, one per line.
const RANGE = Array.from({ length: 1001 }, (_, i) => `${i - 500}\n`).join('');

// A number of each length from 1 to 10 digits, and each one negated.
const LENGTHS = Array.from({ length: 10 }, (_, i) =>
  Number('1234567890'.slice(0, i + 1)),
);

const next = seededRandom(34);

// 200 random ints of random size: a random number of bits, up to 31, so
// small and large values are as likely as each other, and half negated.
const RANDOM = Array.from({ length: 200 }, () => {
  const bits = 1 + (next() % 31);
  const magnitude = next() >>> (32 - bits);

  return next() % 2 === 0 ? magnitude : -magnitude;
});

export const exercise3_4: ExerciseSource = {
  id: '3-4',
  chapter: 3,
  number: 4,
  title: 'itoa for the largest negative number',
  summary:
    'Fix itoa so it converts the largest negative integer correctly, on any machine. K&R exercise 3-4, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '6b7e4d47', expectedStdout: '' },
    // Zero still needs one digit.
    { id: '6dfd8868', stdin: '0\n', expectedStdout: '0\n' },
    // Small positive numbers.
    { id: '71f94260', stdin: '7\n42\n', expectedStdout: '7\n42\n' },
    // Small negative numbers.
    { id: '74e43fbc', stdin: '-7\n-42\n', expectedStdout: '-7\n-42\n' },
    // Trailing zeros.
    {
      id: '751fb9ad',
      stdin: '10\n100\n-1000\n1000000000\n',
      expectedStdout: '10\n100\n-1000\n1000000000\n',
    },
    // A number of each length from 1 to 10 digits, and each one negated.
    {
      id: '0efee65b',
      stdin: lines([...LENGTHS, ...LENGTHS.map((n) => -n)]),
      expectedStdout: lines([...LENGTHS, ...LENGTHS.map((n) => -n)]),
    },
    // The largest int.
    { id: '789491cb', stdin: '2147483647\n', expectedStdout: '2147483647\n' },
    // The largest negative int.
    { id: '789ef2e0', stdin: '-2147483648\n', expectedStdout: '-2147483648\n' },
    // Just above the largest negative int.
    {
      id: '7bc185d2',
      stdin: '-2147483647\n-2147483640\n',
      expectedStdout: '-2147483647\n-2147483640\n',
    },
    // A last line with no newline.
    {
      id: '7fb8b3eb',
      stdin: '1\n-2147483648',
      expectedStdout: '1\n-2147483648\n',
    },
    // Every integer from -500 to 500.
    { id: '815deb3c', stdin: RANGE, expectedStdout: RANGE },
    // 200 random ints, small and large, of both signs.
    {
      id: '40f087a1',
      stdin: lines(RANDOM),
      expectedStdout: lines(RANDOM),
    },
  ],
};
