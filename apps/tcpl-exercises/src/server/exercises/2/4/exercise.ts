import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_4: ExerciseSource = {
  id: '2-4',
  chapter: 2,
  number: 4,
  title: 'Squeeze out characters',
  summary:
    'Delete each character in one string that appears anywhere in another. K&R exercise 2-4, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '3975044b', expectedStdout: '' },
    // Two characters to delete.
    {
      id: '69dee7aa',
      stdin: 'hello world\nlo\n',
      expectedStdout: 'he wrd\n',
    },
    // Every occurrence goes.
    { id: '98c2d608', stdin: 'banana\na\n', expectedStdout: 'bnn\n' },
    // An empty s2 deletes nothing.
    { id: 'e1865e93', stdin: 'hello\n\n', expectedStdout: 'hello\n' },
    // An empty s1.
    { id: '718dd82e', stdin: '\nabc\n', expectedStdout: '\n' },
    // No matches.
    { id: '97c96a23', stdin: 'hello\nxyz\n', expectedStdout: 'hello\n' },
    // Everything is deleted.
    { id: 'b2abd9fe', stdin: 'aaa bbb\nab \n', expectedStdout: '\n' },
    // Repeated characters in s2.
    {
      id: '431d7fb6',
      stdin: 'mississippi\nssss\n',
      expectedStdout: 'miiippi\n',
    },
    // Upper and lower case are different characters.
    {
      id: 'd564c3e8',
      stdin: 'Hello HELLO\nl\n',
      expectedStdout: 'Heo HELLO\n',
    },
    // Blanks and tabs in s2.
    { id: 'cfc6687d', stdin: 'a b\tc d\n \t\n', expectedStdout: 'abcd\n' },
    // Runs at the start and end of s1.
    { id: '04787190', stdin: 'xxabcxx\nx\n', expectedStdout: 'abc\n' },
    // Several pairs.
    { id: '22514987', stdin: 'abc\nb\ndef\nf\n', expectedStdout: 'ac\nde\n' },
    // A last line with no newline.
    { id: '18ef61e3', stdin: 'abc\nb', expectedStdout: 'ac\n' },
    // A 998-character s1.
    {
      id: '56a75e97',
      stdin: 'ab'.repeat(499) + '\na\n',
      expectedStdout: 'b'.repeat(499) + '\n',
    },
    // 500 pairs.
    {
      id: '0e279067',
      stdin: 'the quick brown fox\naeiou\n'.repeat(500),
      expectedStdout: 'th qck brwn fx\n'.repeat(500),
    },
  ],
};
