import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const NUMBERS = Array.from({ length: 1000 }, (_, i) => i * 7 - 3000);

export const exercise7_4: ExerciseSource = {
  id: '7-4',
  chapter: 7,
  number: 4,
  title: 'A private scanf',
  summary:
    'Write a private version of scanf, like minprintf, handling the common conversions with field widths. K&R exercise 7-4, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '59403f33', args: ['%d'], expectedStdout: '' },
    // Integers.
    {
      id: '5f504138',
      args: ['%d'],
      stdin: '1 2 3\n',
      expectedStdout: '1\n2\n3\n',
    },
    // Signs, and white space between values.
    {
      id: '2133be4f',
      args: ['%d'],
      stdin: '-5\n\n\t+7   0\n',
      expectedStdout: '-5\n7\n0\n',
    },
    // Reading stops at something that isn't a number.
    {
      id: '32025029',
      args: ['%d'],
      stdin: '4 5 x 6\n',
      expectedStdout: '4\n5\n',
    },
    // Hexadecimal and octal.
    {
      id: '8391eae8',
      args: ['%x'],
      stdin: 'ff 10 0x1A\n',
      expectedStdout: '255\n16\n26\n',
    },
    {
      id: '58265a10',
      args: ['%o'],
      stdin: '17 10\n',
      expectedStdout: '15\n8\n',
    },
    // Floating point.
    {
      id: '8874808c',
      args: ['%f'],
      stdin: '1.5 -2 3e2 .25\n',
      expectedStdout: '1.5\n-2\n300\n0.25\n',
    },
    // Strings stop at white space.
    {
      id: '51983ed6',
      args: ['%s'],
      stdin: 'hello  world\n\tagain\n',
      expectedStdout: 'hello\nworld\nagain\n',
    },
    // %c reads every character, white space too.
    {
      id: '8e1ca2f6',
      args: ['%c'],
      stdin: 'ab c\n',
      expectedStdout: '[a]\n[b]\n[ ]\n[c]\n[\n]\n',
    },
    // A field width.
    {
      id: '43694131',
      args: ['%2d'],
      stdin: '12345\n',
      expectedStdout: '12\n34\n5\n',
    },
    // Other characters must match.
    {
      id: '74399be8',
      args: ['x=%d;'],
      stdin: 'x=1;x=2;\n',
      expectedStdout: '1\n2\n',
    },
    // A mismatch stops reading.
    {
      id: '5c084427',
      args: ['x=%d;'],
      stdin: 'x=1;y=2;\n',
      expectedStdout: '1\n',
    },
    // White space in the format matches any amount, including none.
    {
      id: '43574ece',
      args: [' %d ,'],
      stdin: '1,  2 ,\n3,\n',
      expectedStdout: '1\n2\n3\n',
    },
    // %% matches a percent sign.
    {
      id: '2e57d62b',
      args: ['%d%%'],
      stdin: '50%25%\n',
      expectedStdout: '50\n25\n',
    },
    // A last value with no newline after it.
    { id: '784937bb', args: ['%d'], stdin: '8 9', expectedStdout: '8\n9\n' },
    // 1000 integers.
    {
      id: '42e7f7f1',
      args: ['%d'],
      stdin: NUMBERS.join(' ') + '\n',
      expectedStdout: NUMBERS.map((n) => `${n}\n`).join(''),
    },
  ],
};
