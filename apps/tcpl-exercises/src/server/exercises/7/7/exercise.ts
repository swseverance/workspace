import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const POEM =
  'Ah Love! could you and I with Fate conspire\n' +
  'To grasp this sorry Scheme of Things entire,\n' +
  'Would not we shatter it to bits -- and then\n' +
  "Re-mould it nearer to the Heart's Desire!\n";

// 1000 lines, every tenth one matching.
const LINES = Array.from({ length: 1000 }, (_, i) =>
  (i + 1) % 10 === 0 ? `match ${i + 1}` : `line ${i + 1}`,
);

export const exercise7_7: ExerciseSource = {
  id: '7-7',
  chapter: 7,
  number: 7,
  title: 'find in named files',
  summary:
    'Make the pattern-finding program read the files named as arguments, or the standard input. K&R exercise 7-7, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The standard input, without file names.
    {
      id: '48ce5957',
      args: ['ould'],
      stdin: POEM,
      expectedStdout:
        'Ah Love! could you and I with Fate conspire\n' +
        'Would not we shatter it to bits -- and then\n' +
        "Re-mould it nearer to the Heart's Desire!\n",
    },
    // The standard input, numbered.
    {
      id: '97edb7ac',
      args: ['-n', 'ould'],
      stdin: POEM,
      expectedStdout:
        '1:Ah Love! could you and I with Fate conspire\n' +
        '3:Would not we shatter it to bits -- and then\n' +
        "4:Re-mould it nearer to the Heart's Desire!\n",
    },
    // One named file.
    {
      id: 'b7c6be58',
      args: ['Scheme', 'poem.txt'],
      files: [{ name: 'poem.txt', content: POEM }],
      expectedStdout: 'poem.txt:To grasp this sorry Scheme of Things entire,\n',
    },
    // Two files, in the order named.
    {
      id: '69dffd3b',
      args: ['cat', 'b.txt', 'a.txt'],
      files: [
        { name: 'a.txt', content: 'a cat\nno\n' },
        { name: 'b.txt', content: 'no\nb cat\n' },
      ],
      expectedStdout: 'b.txt:b cat\na.txt:a cat\n',
    },
    // Line numbers start again for each file.
    {
      id: 'fd618a47',
      args: ['-n', 'x', 'a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'x1\ny\nx3\n' },
        { name: 'b.txt', content: 'y\nx2\n' },
      ],
      expectedStdout: 'a.txt:1:x1\na.txt:3:x3\nb.txt:2:x2\n',
    },
    // -x: the lines that don't match.
    {
      id: '3bea2714',
      args: ['-x', 'ould', 'poem.txt'],
      files: [{ name: 'poem.txt', content: POEM }],
      expectedStdout: 'poem.txt:To grasp this sorry Scheme of Things entire,\n',
    },
    // -xn together.
    {
      id: 'f4be54aa',
      args: ['-xn', 'a', 'f.txt'],
      files: [{ name: 'f.txt', content: 'a\nb\na\nc\n' }],
      expectedStdout: 'f.txt:2:b\nf.txt:4:c\n',
    },
    // No matches.
    {
      id: 'd0a619ec',
      args: ['zzz', 'poem.txt'],
      files: [{ name: 'poem.txt', content: POEM }],
      expectedStdout: '',
    },
    // A last line with no newline still ends with one.
    {
      id: '92fdf9c0',
      args: ['x', 'a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'x1\nx2' },
        { name: 'b.txt', content: 'x3\n' },
      ],
      expectedStdout: 'a.txt:x1\na.txt:x2\nb.txt:x3\n',
    },
    // An empty file.
    {
      id: '9ffd8b8f',
      args: ['x', 'empty.txt', 'a.txt'],
      files: [
        { name: 'empty.txt', content: '' },
        { name: 'a.txt', content: 'x\n' },
      ],
      expectedStdout: 'a.txt:x\n',
    },
    // 1000 lines.
    {
      id: '54fbe29b',
      args: ['-n', 'match', 'big.txt'],
      files: [
        { name: 'big.txt', content: LINES.map((l) => `${l}\n`).join('') },
      ],
      expectedStdout: LINES.map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => line.startsWith('match'))
        .map(({ line, n }) => `big.txt:${n}:${line}\n`)
        .join(''),
    },
  ],
};
