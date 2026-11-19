import { ExerciseSource } from '../../../../models/exercise';
import { seededRandom } from '../../utils';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

/** escape as the exercise defines it. */
function escape(t: string): string {
  return t
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll('\t', '\\t');
}

const next = seededRandom(321);

// 200 random lines of up to 40 characters: the three that are converted,
// and ones that aren't, among them the letters n and t, a carriage return
// and quotes.
const ALPHABET = ['\t', '\\', 'n', 't', 'a', ' ', '\r', '"', "'"];
const RANDOM = Array.from({ length: 200 }, () =>
  Array.from(
    { length: next() % 41 },
    () => ALPHABET[next() % ALPHABET.length],
  ).join(''),
);

export const exercise3_2a: ExerciseSource = {
  id: '3-2a',
  chapter: 3,
  number: 2,
  suffix: 'a',
  title: 'Make escape sequences visible',
  summary:
    'Turn newlines, tabs and backslashes into visible escape sequences like \\n and \\t. K&R exercise 3-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '40dfd882', expectedStdout: '' },
    // The example.
    { id: '2d45c15d', stdin: 'a\tb\n', expectedStdout: 'a\\tb\\n\n' },
    // Only the newline to convert.
    { id: '9c11debe', stdin: 'hello\n', expectedStdout: 'hello\\n\n' },
    // A last line with no newline has none to convert.
    { id: '9850b925', stdin: 'hello', expectedStdout: 'hello\n' },
    // Tabs: first, last and two in a row.
    {
      id: 'f700ada7',
      stdin: '\ta\t\tb\t\n',
      expectedStdout: '\\ta\\t\\tb\\t\\n\n',
    },
    // Several lines, including a blank one.
    {
      id: '9a1892f5',
      stdin: 'one\n\ntwo\n',
      expectedStdout: 'one\\n\n\\n\ntwo\\n\n',
    },
    // Blanks stay as they are.
    { id: 'f5d4ac0e', stdin: '  a  b  \n', expectedStdout: '  a  b  \\n\n' },
    // Each backslash is doubled.
    {
      id: 'ac7616af',
      stdin: 'C:\\dir\\file\n',
      expectedStdout: 'C:\\\\dir\\\\file\\n\n',
    },
    // Escape sequences typed in the input: only their backslashes change.
    {
      id: '890b169d',
      stdin: 'x\\ty\\nz\\\\\n',
      expectedStdout: 'x\\\\ty\\\\nz\\\\\\\\\\n\n',
    },
    // Other control characters and quotes are copied unchanged.
    {
      id: 'c11045b8',
      stdin: 'a\rb\x0bc\x0cd\x07e\x08f"g\'h\n',
      expectedStdout: 'a\rb\x0bc\x0cd\x07e\x08f"g\'h\\n\n',
    },
    // 500 tabs: s is twice as long as t.
    {
      id: '9892e8e2',
      stdin: '\t'.repeat(500) + '\n',
      expectedStdout: '\\t'.repeat(500) + '\\n\n',
    },
    // 500 backslashes with no newline, then the end of the input.
    {
      id: '6150c1c6',
      stdin: '\\'.repeat(500),
      expectedStdout: '\\'.repeat(1000) + '\n',
    },
    // 200 random lines, checked against escape written in TypeScript.
    {
      id: 'b8a78985',
      stdin: RANDOM.map((line) => `${line}\n`).join(''),
      expectedStdout: RANDOM.map((line) => `${escape(`${line}\n`)}\n`).join(''),
    },
  ],
};
