import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 500 pairs that all differ: the match moves back and forth through s1, so
// each s1 is longer or shorter than the one before, and every seventh pair
// has no match.
const PAIRS = Array.from({ length: 500 }, (_, i) => {
  const at = (i * 37) % 100;
  const found = i % 7 !== 0;
  return {
    s1: 'a'.repeat(at) + (found ? 'b' : 'a'),
    s2: 'cb',
    answer: found ? at : -1,
  };
});

export const exercise2_5: ExerciseSource = {
  id: '2-5',
  chapter: 2,
  number: 5,
  title: 'First occurrence of any character',
  summary:
    'Find the first position in one string of any character from another, or -1 if there is none. K&R exercise 2-5, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'ee3eaa0f', expectedStdout: '' },
    // A match in the middle.
    { id: 'ec94e071', stdin: 'hello\nl\n', expectedStdout: '2\n' },
    // A match at the start.
    { id: '006c31f2', stdin: 'hello\nh\n', expectedStdout: '0\n' },
    // A match at the end.
    { id: '80489687', stdin: 'hello\no\n', expectedStdout: '4\n' },
    // No match.
    { id: '9bb31332', stdin: 'hello\nxyz\n', expectedStdout: '-1\n' },
    // The earliest position in s1, not the first character of s2.
    { id: '17e0eb19', stdin: 'hello\nol\n', expectedStdout: '2\n' },
    // An empty s2.
    { id: '3bd5300e', stdin: 'hello\n\n', expectedStdout: '-1\n' },
    // An empty s1.
    { id: 'a486e60e', stdin: '\nabc\n', expectedStdout: '-1\n' },
    // An s2 longer than s1.
    { id: 'c02140c9', stdin: 'ab\nxyzb\n', expectedStdout: '1\n' },
    // A blank in s2.
    { id: '3ed7767e', stdin: 'hello world\n \n', expectedStdout: '5\n' },
    // Blanks at the start of s1 count as characters.
    { id: 'f59e68b7', stdin: '  ab\nb\n', expectedStdout: '3\n' },
    // A blank at the end of s1 can be the match.
    { id: '1bf81891', stdin: 'ab \n \n', expectedStdout: '2\n' },
    // Upper and lower case are different characters.
    { id: 'cebb19cc', stdin: 'Hello\nh\n', expectedStdout: '-1\n' },
    // Several pairs.
    {
      id: '5e4d63c3',
      stdin: 'abc\nc\nabc\nz\nabc\ncba\n',
      expectedStdout: '2\n-1\n0\n',
    },
    // An empty s2 after one that wasn't.
    { id: 'fce42e5d', stdin: 'abc\nb\nabc\n\n', expectedStdout: '1\n-1\n' },
    // A last line with no newline.
    { id: '98586332', stdin: 'abc\nb', expectedStdout: '1\n' },
    // A match at the end of a 500-character s1.
    {
      id: 'e28d29ae',
      stdin: 'a'.repeat(499) + 'b\nb\n',
      expectedStdout: '499\n',
    },
    // A match with the last character of a 500-character s2.
    {
      id: '41a80eaf',
      stdin: 'hello\n' + 'x'.repeat(499) + 'o\n',
      expectedStdout: '4\n',
    },
    // 500 pairs, each with its own answer.
    {
      id: 'b0c7d0d3',
      stdin: PAIRS.map((pair) => `${pair.s1}\n${pair.s2}\n`).join(''),
      expectedStdout: PAIRS.map((pair) => `${pair.answer}\n`).join(''),
    },
  ],
};
