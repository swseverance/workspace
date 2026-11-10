import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_3: ExerciseSource = {
  id: '2-3',
  chapter: 2,
  number: 3,
  title: 'Convert hexadecimal to an integer',
  summary:
    'Write htoi, which converts a string of hexadecimal digits, with an optional 0x prefix, to an integer. K&R exercise 2-3, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'ab787f94', expectedStdout: '' },
    // A single decimal digit.
    { id: '9644bfd4', stdin: '7\n', expectedStdout: '7\n' },
    // Lower case letters.
    { id: '0c8f8343', stdin: 'ff\n', expectedStdout: '255\n' },
    // Upper case letters.
    { id: '3e56adf2', stdin: 'FF\n', expectedStdout: '255\n' },
    // Mixed case.
    { id: 'a7b165bb', stdin: 'aBcD\n', expectedStdout: '43981\n' },
    // A 0x prefix.
    { id: '3a9a9ee2', stdin: '0x1A\n', expectedStdout: '26\n' },
    // A 0X prefix.
    { id: '811ee064', stdin: '0X1a\n', expectedStdout: '26\n' },
    // Zero with a prefix, and leading zeros.
    { id: 'eb947aa6', stdin: '0x0\n000010\n', expectedStdout: '0\n16\n' },
    // Every digit.
    {
      id: 'b10865c7',
      stdin: '1234567\n89ABCDE\nfedcba\n',
      expectedStdout: '19088743\n144358622\n16702650\n',
    },
    // The largest int, with and without a prefix.
    {
      id: 'ece34a44',
      stdin: '7fffffff\n0x7FFFFFFF\n',
      expectedStdout: '2147483647\n2147483647\n',
    },
    // A last line with no newline.
    { id: '30d2df39', stdin: '10\nff', expectedStdout: '16\n255\n' },
    // 0 to 999 in hexadecimal.
    {
      id: '844aefc0',
      stdin: Array.from({ length: 1000 }, (_, i) => i.toString(16) + '\n').join(
        '',
      ),
      expectedStdout: Array.from({ length: 1000 }, (_, i) => `${i}\n`).join(''),
    },
    // 0X-prefixed upper case, 0 to 999.
    {
      id: 'f25f0aec',
      stdin: Array.from(
        { length: 1000 },
        (_, i) => '0X' + i.toString(16).toUpperCase() + '\n',
      ).join(''),
      expectedStdout: Array.from({ length: 1000 }, (_, i) => `${i}\n`).join(''),
    },
  ],
};
