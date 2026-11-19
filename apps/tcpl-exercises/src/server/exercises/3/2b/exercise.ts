import { ExerciseSource } from '../../../../models/exercise';
import { seededRandom } from '../../utils';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

/** unescape as the exercise defines it. */
function unescape(t: string): string {
  return t.replace(/\\([nt\\])/g, (_, c: string) =>
    c === 'n' ? '\n' : c === 't' ? '\t' : '\\',
  );
}

const next = seededRandom(322);

// 200 random lines of up to 40 characters, about a third of them
// backslashes: sequences, runs of backslashes, and backslashes before
// characters that make no sequence.
const ALPHABET = ['\\', '\\', '\\', 'n', 't', 'a', 'N', ' ', '\t'];
const RANDOM = Array.from({ length: 200 }, () =>
  Array.from(
    { length: next() % 41 },
    () => ALPHABET[next() % ALPHABET.length],
  ).join(''),
);

export const exercise3_2b: ExerciseSource = {
  id: '3-2b',
  chapter: 3,
  number: 2,
  suffix: 'b',
  title: 'Turn escape sequences into characters',
  summary:
    'Turn visible escape sequences like \\n and \\t back into the real characters. K&R exercise 3-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'c45d20e5', expectedStdout: '' },
    // The example.
    {
      id: '2363d5d8',
      stdin: 'one\\ntwo\\\\\n',
      expectedStdout: 'one\ntwo\\\n',
    },
    // Nothing to convert.
    { id: 'ee9fe89f', stdin: 'hello\n', expectedStdout: 'hello\n' },
    // A tab.
    { id: 'aef03e48', stdin: 'a\\tb\n', expectedStdout: 'a\tb\n' },
    // Sequences first, last and next to each other.
    {
      id: 'e13a44a5',
      stdin: '\\ta\\t\\nb\\n\n',
      expectedStdout: '\ta\t\nb\n\n',
    },
    // Several lines, including an empty one, and the last with no newline.
    {
      id: '9fff053c',
      stdin: 'a\\tb\n\nc\\td',
      expectedStdout: 'a\tb\n\nc\td\n',
    },
    // Real tabs and blanks stay as they are.
    { id: '825b3528', stdin: ' a\tb \n', expectedStdout: ' a\tb \n' },
    // The letters n and t with no backslash before them.
    { id: 'e8e05a5a', stdin: 'not ten\n', expectedStdout: 'not ten\n' },
    // An escaped backslash followed by n is a backslash and an n.
    { id: 'e11b452b', stdin: 'a\\\\nb\n', expectedStdout: 'a\\nb\n' },
    // Three backslashes and an n: a backslash, then a newline.
    { id: 'dcdf9758', stdin: 'a\\\\\\nb\n', expectedStdout: 'a\\\nb\n' },
    // Backslashes that start no sequence are copied, with what follows.
    {
      id: 'c0a89938',
      stdin: 'a\\qb\\0c\\ d\\"e\n',
      expectedStdout: 'a\\qb\\0c\\ d\\"e\n',
    },
    // C's other escape sequences aren't converted.
    {
      id: '666f62eb',
      stdin: "a\\rb\\ac\\bd\\fe\\vf\\'g\\?h\n",
      expectedStdout: "a\\rb\\ac\\bd\\fe\\vf\\'g\\?h\n",
    },
    // Upper case N and T make no sequence.
    { id: '7ea01255', stdin: 'a\\Nb\\Tc\n', expectedStdout: 'a\\Nb\\Tc\n' },
    // A backslash before a real tab.
    { id: '6e68ed29', stdin: 'a\\\tb\n', expectedStdout: 'a\\\tb\n' },
    // A backslash at the end of a line, the next line starting with n.
    { id: '305683a6', stdin: 'end\\\nn\n', expectedStdout: 'end\\\nn\n' },
    // A backslash at the very end of the input.
    { id: '646d78c4', stdin: 'end\\', expectedStdout: 'end\\\n' },
    // 500 backslashes are 250 pairs.
    {
      id: '039817ef',
      stdin: '\\'.repeat(500) + '\n',
      expectedStdout: '\\'.repeat(250) + '\n',
    },
    // 499 backslashes: 249 pairs and one left over.
    {
      id: 'e0be5195',
      stdin: '\\'.repeat(499) + '\n',
      expectedStdout: '\\'.repeat(250) + '\n',
    },
    // 500 characters, the last a backslash.
    {
      id: 'c4755ab8',
      stdin: 'x'.repeat(499) + '\\\n',
      expectedStdout: 'x'.repeat(499) + '\\\n',
    },
    // 500 characters with nothing to convert.
    {
      id: 'e535cd5f',
      stdin: 'x'.repeat(500) + '\n',
      expectedStdout: 'x'.repeat(500) + '\n',
    },
    // 250 newlines from one line.
    {
      id: 'e5c6c3d4',
      stdin: '\\n'.repeat(250) + '\n',
      expectedStdout: '\n'.repeat(251),
    },
    // 200 random lines, checked against unescape written in TypeScript.
    {
      id: '83675d7f',
      stdin: RANDOM.map((line) => `${line}\n`).join(''),
      expectedStdout: RANDOM.map((line) => `${unescape(line)}\n`).join(''),
    },
  ],
};
