import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// v[i] = 3i for 1000 elements, searched for every element and the value
// just above each, plus one value below them all.
const STRESS_N = 1000;
const STRESS_V = Array.from({ length: STRESS_N }, (_, i) => `${3 * i}\n`);
const STRESS_X = Array.from(
  { length: STRESS_N },
  (_, i) => `${3 * i}\n${3 * i + 1}\n`,
);
const STRESS_OUT = Array.from({ length: STRESS_N }, (_, i) => `${i}\n-1\n`);

export const exercise3_1: ExerciseSource = {
  id: '3-1',
  chapter: 3,
  number: 1,
  title: 'Binary search with one test in the loop',
  summary:
    'Find a value in a sorted array by binary search, making only one test inside the loop. K&R exercise 3-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '0052bcf3', expectedStdout: '' },
    // An empty array holds nothing.
    { id: '03cabb8f', stdin: '0\n5\n', expectedStdout: '-1\n' },
    // One element: found, below it, above it.
    {
      id: '0472d5c5',
      stdin: '1\n42\n42\n41\n43\n',
      expectedStdout: '0\n-1\n-1\n',
    },
    // Two elements: each one, and either side of and between them.
    {
      id: '096393e7',
      stdin: '2\n1\n3\n0\n1\n2\n3\n4\n',
      expectedStdout: '-1\n0\n-1\n1\n-1\n',
    },
    // Odd length: every element and every gap.
    {
      id: '0997eda1',
      stdin:
        '5\n10\n20\n30\n40\n50\n5\n10\n15\n20\n25\n30\n35\n40\n45\n50\n55\n',
      expectedStdout: '-1\n0\n-1\n1\n-1\n2\n-1\n3\n-1\n4\n-1\n',
    },
    // Even length: every element, both ends, and a gap.
    {
      id: '09bdb789',
      stdin: '6\n10\n20\n30\n40\n50\n60\n5\n10\n20\n30\n40\n50\n60\n65\n35\n',
      expectedStdout: '-1\n0\n1\n2\n3\n4\n5\n-1\n-1\n',
    },
    // Negative and large values.
    {
      id: '0e66b86a',
      stdin:
        '5\n-2000000000\n-5\n0\n7\n2000000000\n' +
        '2000000000\n-2000000000\n-5\n0\n7\n-6\n1999999999\n2147483647\n',
      expectedStdout: '4\n0\n1\n2\n3\n-1\n-1\n-1\n',
    },
    // A last line with no newline.
    { id: '0ed8e7e6', stdin: '3\n1\n2\n3\n2', expectedStdout: '1\n' },
    // 1000 elements, 2001 searches.
    {
      id: '135c84e9',
      stdin: `${STRESS_N}\n` + STRESS_V.join('') + '-1\n' + STRESS_X.join(''),
      expectedStdout: '-1\n' + STRESS_OUT.join(''),
    },
  ],
};
