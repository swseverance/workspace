import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise5_5: ExerciseSource = {
  id: '5-5',
  chapter: 5,
  number: 5,
  title: 'strncpy, strncat and strncmp',
  summary:
    'Write versions of strncpy, strncat and strncmp, which use at most the first n characters of their strings. K&R exercise 5-5, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '0d3a92e7', expectedStdout: '' },
    // n shorter than both strings: strncpy adds no '\0'.
    {
      id: '92c64b28',
      stdin: 'hello\nworld\n3\n',
      expectedStdout: 'worlo\nhellowor\n-1\n',
    },
    // n longer than t: strncpy pads with '\0's.
    {
      id: '3638a58f',
      stdin: 'abc\nxy\n5\n',
      expectedStdout: 'xy\nabcxy\n-1\n',
    },
    // n of 0 does nothing.
    { id: '5473870b', stdin: 'abc\nxyz\n0\n', expectedStdout: 'abc\nabc\n0\n' },
    // strncmp only looks at the first n characters.
    {
      id: 'b19aa9eb',
      stdin: 'apple\napricot\n2\napple\napricot\n3\n',
      expectedStdout: 'apple\nappleap\n0\naprle\nappleapr\n-1\n',
    },
    // s greater than t.
    {
      id: 'd1ac53af',
      stdin: 'zoo\nabc\n2\n',
      expectedStdout: 'abo\nzooab\n1\n',
    },
    // Equal strings shorter than n.
    {
      id: '6e28bb1d',
      stdin: 'same\nsame\n10\n',
      expectedStdout: 'same\nsamesame\n0\n',
    },
    // s is a prefix of t.
    {
      id: 'c61daa48',
      stdin: 'ab\nabc\n10\n',
      expectedStdout: 'abc\nababc\n-1\n',
    },
    // strncpy runs past the end of a short s.
    {
      id: '82393eb5',
      stdin: 'hi\nabcdef\n4\n',
      expectedStdout: 'abcd\nhiabcd\n1\n',
    },
    // An empty s.
    { id: '710ca34b', stdin: '\nxyz\n2\n', expectedStdout: 'xy\nxy\n-1\n' },
    // An empty t.
    { id: 'aa526bc6', stdin: 'abc\n\n2\n', expectedStdout: '\nabc\n1\n' },
    // A last line with no newline.
    { id: 'f5e5f442', stdin: 'hi\nthere\n1', expectedStdout: 'ti\nhit\n-1\n' },
    // 1000-character strings, n of 1000.
    {
      id: 'a2fc8953',
      stdin: 'a'.repeat(1000) + '\n' + 'b'.repeat(1000) + '\n1000\n',
      expectedStdout:
        'b'.repeat(1000) +
        '\n' +
        'a'.repeat(1000) +
        'b'.repeat(1000) +
        '\n-1\n',
    },
  ],
};
