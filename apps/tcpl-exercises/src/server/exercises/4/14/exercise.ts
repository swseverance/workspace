import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 500 lines of k and -k.
const PAIRS = Array.from({ length: 500 }, (_, i) => i + 1);

export const exercise4_14: ExerciseSource = {
  id: '4-14',
  chapter: 4,
  number: 14,
  title: 'A swap macro',
  summary:
    'Define a macro swap(t,x,y) that interchanges two arguments of type t. K&R exercise 4-14, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '12e5fd88', expectedStdout: '' },
    // Two different numbers.
    { id: '7fdcb49a', stdin: '1 2\n', expectedStdout: '2 1\n' },
    // Negative numbers and zero.
    { id: '4d495b08', stdin: '-5 7\n0 9\n', expectedStdout: '7 -5\n9 0\n' },
    // Two equal numbers.
    { id: '6a973588', stdin: '3 3\n', expectedStdout: '3 3\n' },
    // The largest and largest negative ints.
    {
      id: '5b0ad01c',
      stdin: '-2147483648 2147483647\n',
      expectedStdout: '2147483647 -2147483648\n',
    },
    // Several lines.
    {
      id: 'dfc35d20',
      stdin: '1 2\n3 4\n5 6\n',
      expectedStdout: '2 1\n4 3\n6 5\n',
    },
    // A last line with no newline.
    { id: '7d17624b', stdin: '8 9', expectedStdout: '9 8\n' },
    // 500 lines.
    {
      id: 'a94fea24',
      stdin: PAIRS.map((k) => `${k} -${k}\n`).join(''),
      expectedStdout: PAIRS.map((k) => `-${k} ${k}\n`).join(''),
    },
  ],
};
