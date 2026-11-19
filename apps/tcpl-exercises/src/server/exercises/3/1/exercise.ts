import {
  ExerciseSource,
  ExerciseTestCaseSource,
} from '../../../../models/exercise';
import { lines, seededRandom } from '../../utils';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

/** A test that searches v for each of xs, checked against indexOf. */
function search(
  id: string,
  v: readonly number[],
  xs: readonly number[],
): ExerciseTestCaseSource {
  return {
    id,
    stdin: lines([v.length, ...v, ...xs]),
    expectedStdout: lines(xs.map((x) => v.indexOf(x))),
  };
}

const next = seededRandom(31);

/**
 * n distinct random values over the whole range of int, in increasing
 * order, searched in random order for every element, the values either
 * side of each, and both ends of the range.
 */
function random(id: string, n: number): ExerciseTestCaseSource {
  const values = new Set<number>();
  while (values.size < n) {
    values.add(next() | 0);
  }

  const v = [...values].sort((a, b) => a - b);
  const xs = [
    ...new Set([INT_MIN, INT_MAX, ...v.flatMap((e) => [e - 1, e, e + 1])]),
  ].filter((x) => x >= INT_MIN && x <= INT_MAX);

  // Fisher-Yates shuffle.
  for (let i = xs.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }

  return search(id, v, xs);
}

// 1000 random values from 0 to 199, so each appears about five times, in
// increasing order.
const REPEATED = Array.from({ length: 1000 }, () => next() % 200).sort(
  (a, b) => a - b,
);

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
    // An empty array holds nothing.
    { id: 'eaa144c7', stdin: '0\n5\n0\n-1\n', expectedStdout: '-1\n-1\n-1\n' },
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
    // Three elements the same: the first, not the middle one.
    { id: 'e5fe70d8', stdin: '3\n7\n7\n7\n7\n', expectedStdout: '0\n' },
    // Runs of equal elements: the first of each run.
    {
      id: 'bd965516',
      stdin: '7\n1\n1\n2\n2\n2\n3\n3\n0\n1\n2\n3\n4\n',
      expectedStdout: '-1\n0\n2\n5\n-1\n',
    },
    // Negative elements, and 0 above them all.
    {
      id: '95f4a60f',
      stdin: '3\n-3\n-2\n-1\n-1\n0\n',
      expectedStdout: '2\n-1\n',
    },
    // Two elements too far apart to subtract.
    {
      id: '1d6f27da',
      stdin: '2\n-2000000000\n2000000000\n-2000000000\n2000000000\n0\n',
      expectedStdout: '0\n1\n-1\n',
    },
    // The smallest and largest int, and the values next to them.
    {
      id: '7102024b',
      stdin:
        '5\n-2147483648\n-1\n0\n1\n2147483647\n' +
        '-2147483648\n2147483647\n0\n-2147483647\n2147483646\n',
      expectedStdout: '0\n4\n2\n-1\n-1\n',
    },
    // 50 random elements, checked against indexOf in TypeScript.
    random('e683c07c', 50),
    // 1000 random elements, checked the same way.
    random('86d7e7b0', 1000),
    // 1000 random elements with repeats, searched for -1 to 200.
    search(
      'cda91533',
      REPEATED,
      Array.from({ length: 202 }, (_, i) => i - 1),
    ),
    // 1000 elements, 2001 searches.
    {
      id: '135c84e9',
      stdin: `${STRESS_N}\n` + STRESS_V.join('') + '-1\n' + STRESS_X.join(''),
      expectedStdout: '-1\n' + STRESS_OUT.join(''),
    },
  ],
};
