import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

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
    // A blank in s2.
    { id: '3ed7767e', stdin: 'hello world\n \n', expectedStdout: '5\n' },
    // Upper and lower case are different characters.
    { id: 'cebb19cc', stdin: 'Hello\nh\n', expectedStdout: '-1\n' },
    // Several pairs.
    {
      id: '5e4d63c3',
      stdin: 'abc\nc\nabc\nz\nabc\ncba\n',
      expectedStdout: '2\n-1\n0\n',
    },
    // A last line with no newline.
    { id: '98586332', stdin: 'abc\nb', expectedStdout: '1\n' },
    // A match at the end of a 998-character s1.
    {
      id: '240c5a7e',
      stdin: 'a'.repeat(997) + 'b\nb\n',
      expectedStdout: '997\n',
    },
    // 500 pairs.
    {
      id: 'b74101ab',
      stdin: 'the quick brown fox\nxyz\n'.repeat(500),
      expectedStdout: '18\n'.repeat(500),
    },
  ],
};
