import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_1: ExerciseSource = {
  id: '4-1',
  chapter: 4,
  number: 1,
  title: 'Rightmost occurrence of a string',
  summary:
    'Find the position of the rightmost occurrence of one string in another, or -1 if there is none. K&R exercise 4-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'ae767877', expectedStdout: '' },
    // One occurrence.
    { id: 'acf9a367', stdin: 'hello world\nworld\n', expectedStdout: '6\n' },
    // Several occurrences: the last one counts.
    { id: '41fb1970', stdin: 'abcabcabc\nabc\n', expectedStdout: '6\n' },
    // A single character, last in s.
    { id: 'bad0463c', stdin: 'banana\na\n', expectedStdout: '5\n' },
    // Only at the start.
    { id: '363f1119', stdin: 'abcdef\nabc\n', expectedStdout: '0\n' },
    // Not there at all.
    { id: 'f0a39030', stdin: 'hello\nxyz\n', expectedStdout: '-1\n' },
    // Part of t at the end of s doesn't count.
    { id: '24e7afe9', stdin: 'abcab\nabc\n', expectedStdout: '0\n' },
    // t longer than s, and t equal to s.
    {
      id: 'b84e9e63',
      stdin: 'ab\nabc\nsame\nsame\n',
      expectedStdout: '-1\n0\n',
    },
    // Overlapping occurrences.
    { id: '9a1656ef', stdin: 'aaaa\naa\n', expectedStdout: '2\n' },
    // Upper and lower case differ.
    { id: '228c5e9c', stdin: 'Hello hello\nH\n', expectedStdout: '0\n' },
    // An empty s, then an empty t.
    { id: 'dd0176ae', stdin: '\nabc\nabc\n\n', expectedStdout: '-1\n-1\n' },
    // A last line with no newline.
    { id: '60d6ccb9', stdin: 'find me\nme', expectedStdout: '5\n' },
    // 1000-character lines with many near misses.
    {
      id: '5cc5d0ed',
      stdin:
        'a'.repeat(1000) +
        '\n' +
        'a'.repeat(100) +
        '\n' +
        'a'.repeat(1000) +
        '\n' +
        'a'.repeat(99) +
        'b\n',
      expectedStdout: '900\n-1\n',
    },
  ],
};
