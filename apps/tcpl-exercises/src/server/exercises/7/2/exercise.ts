import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// The description's rules, for ASCII input.
function visible(input: string): string {
  let out = '';
  let col = 0;
  for (const ch of input) {
    if (ch === '\n') {
      out += ch;
      col = 0;
      continue;
    }
    const code = ch.charCodeAt(0);
    const shown =
      code >= 32 && code <= 126
        ? ch
        : '\\x' + code.toString(16).padStart(2, '0');
    if (col + shown.length > 40) {
      out += '\n';
      col = 0;
    }
    out += shown;
    col += shown.length;
  }
  return out;
}

// Every ASCII character but newline, three times over.
const ASCII = Array.from({ length: 128 }, (_, i) => String.fromCharCode(i))
  .filter((ch) => ch !== '\n')
  .join('')
  .repeat(3);

export const exercise7_2: ExerciseSource = {
  id: '7-2',
  chapter: 7,
  number: 2,
  title: 'Print anything visibly',
  summary:
    'Print arbitrary input sensibly, with non-graphic characters in hexadecimal and long lines broken. K&R exercise 7-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'e0ac7ea7', expectedStdout: '' },
    // Ordinary text is unchanged.
    {
      id: '5da0fefb',
      stdin: 'hello, world\n',
      expectedStdout: 'hello, world\n',
    },
    // Tabs and carriage returns in hexadecimal.
    { id: '22e5c96f', stdin: 'a\tb\r\n', expectedStdout: 'a\\x09b\\x0d\n' },
    // NUL, escape and delete.
    {
      id: '463bb09a',
      stdin: '\0\x1b\x7f\n',
      expectedStdout: '\\x00\\x1b\\x7f\n',
    },
    // Each byte of a non-ASCII character.
    { id: 'c103fe82', stdin: 'é\n', expectedStdout: '\\xc3\\xa9\n' },
    // A line of exactly 40 characters isn't broken.
    {
      id: '3b2ca8a7',
      stdin: 'x'.repeat(40) + '\n',
      expectedStdout: 'x'.repeat(40) + '\n',
    },
    // 41 characters are.
    {
      id: 'ff1f26ed',
      stdin: 'x'.repeat(41) + '\n',
      expectedStdout: 'x'.repeat(40) + '\nx\n',
    },
    // A \xhh that wouldn't fit starts the next line.
    {
      id: '77c612bf',
      stdin: 'x'.repeat(38) + '\ty\n',
      expectedStdout: 'x'.repeat(38) + '\n\\x09y\n',
    },
    // A \xhh that just fits stays.
    {
      id: '636d10cc',
      stdin: 'x'.repeat(36) + '\t\n',
      expectedStdout: 'x'.repeat(36) + '\\x09\n',
    },
    // Blanks are kept where a line breaks.
    {
      id: '9fe5b1c0',
      stdin: 'x'.repeat(39) + '  y\n',
      expectedStdout: 'x'.repeat(39) + ' \n y\n',
    },
    // Blank lines.
    { id: '70c458f7', stdin: '\n\na\n', expectedStdout: '\n\na\n' },
    // A last line with no newline.
    { id: 'f885c9fc', stdin: 'ab\t', expectedStdout: 'ab\\x09' },
    // A 1000-character line.
    {
      id: '82f5b89c',
      stdin: 'abcdefghij'.repeat(100) + '\n',
      expectedStdout: visible('abcdefghij'.repeat(100) + '\n'),
    },
    // Every ASCII character.
    {
      id: 'a1d5f32d',
      stdin: ASCII + '\n',
      expectedStdout: visible(ASCII + '\n'),
    },
  ],
};
