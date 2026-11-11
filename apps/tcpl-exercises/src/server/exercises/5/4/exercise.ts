import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise5_4: ExerciseSource = {
  id: '5-4',
  chapter: 5,
  number: 4,
  title: 'Does one string end with another',
  summary:
    'Write strend(s,t), which returns 1 if the string t occurs at the end of s and 0 otherwise. K&R exercise 5-4, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '1c4ce6ca', expectedStdout: '' },
    // At the end.
    { id: 'db86eaf1', stdin: 'hello world\nworld\n', expectedStdout: '1\n' },
    // Not there at all.
    { id: '61f0fb9d', stdin: 'hello\nxyz\n', expectedStdout: '0\n' },
    // In s, but not at the end.
    { id: '39a96b21', stdin: 'worldwide\nworld\n', expectedStdout: '0\n' },
    // Only the last part matches.
    {
      id: '3f777740',
      stdin: 'xabc\nabd\nxabc\nzbc\n',
      expectedStdout: '0\n0\n',
    },
    // t is all of s.
    { id: 'de94bce7', stdin: 'same\nsame\n', expectedStdout: '1\n' },
    // t is longer than s, and ends the same way.
    { id: '5446835b', stdin: 'bc\nabc\n', expectedStdout: '0\n' },
    // A repeated ending.
    { id: 'dc1ac176', stdin: 'aaa\naa\n', expectedStdout: '1\n' },
    // An empty t, an empty s, and both empty.
    {
      id: '67967b81',
      stdin: 'abc\n\n\nabc\n\n\n',
      expectedStdout: '1\n0\n1\n',
    },
    // Upper and lower case differ.
    { id: 'e2de3685', stdin: 'Hello\nLLO\n', expectedStdout: '0\n' },
    // A last line with no newline.
    { id: '098d50b5', stdin: 'find me\nme', expectedStdout: '1\n' },
    // 1000-character lines, matching all but the first character.
    {
      id: 'eee05aa5',
      stdin:
        'a'.repeat(1000) +
        '\n' +
        'a'.repeat(999) +
        '\n' +
        'a'.repeat(1000) +
        '\n' +
        'b' +
        'a'.repeat(999) +
        '\n',
      expectedStdout: '1\n0\n',
    },
  ],
};
