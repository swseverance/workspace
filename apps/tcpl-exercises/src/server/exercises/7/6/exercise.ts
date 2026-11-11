import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const AB = ['a.txt', 'b.txt'];
const files = (a: string, b: string) => [
  { name: 'a.txt', content: a },
  { name: 'b.txt', content: b },
];

// 1000 numbered lines, and the same with line 777 changed.
const LINES = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`);
const CHANGED = LINES.map((line, i) =>
  i === 776 ? 'line seven seven seven' : line,
);
const text = (lines: string[]) => lines.map((line) => `${line}\n`).join('');

export const exercise7_6: ExerciseSource = {
  id: '7-6',
  chapter: 7,
  number: 6,
  title: 'Compare two files',
  summary:
    'Compare two files named on the command line, printing the first line where they differ. K&R exercise 7-6, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The same files.
    {
      id: 'b05be4b5',
      args: AB,
      files: files('one\ntwo\n', 'one\ntwo\n'),
      expectedStdout: '',
    },
    // Different first lines.
    {
      id: '4e3ca9f2',
      args: AB,
      files: files('x\n', 'y\n'),
      expectedStdout: 'a.txt:1: x\nb.txt:1: y\n',
    },
    // Only the first difference is printed.
    {
      id: '063971c0',
      args: AB,
      files: files('1\n2\n3\n4\n', '1\n2\nthree\nfour\n'),
      expectedStdout: 'a.txt:3: 3\nb.txt:3: three\n',
    },
    // The first file ends first.
    {
      id: 'bc3ea64a',
      args: AB,
      files: files('1\n2\n', '1\n2\n3\n'),
      expectedStdout: 'a.txt:3: EOF\nb.txt:3: 3\n',
    },
    // The second file ends first.
    {
      id: '1ad5c8fa',
      args: AB,
      files: files('1\n2\n3\n', '1\n'),
      expectedStdout: 'a.txt:2: 2\nb.txt:2: EOF\n',
    },
    // Two empty files.
    { id: '83be190a', args: AB, files: files('', ''), expectedStdout: '' },
    // One empty file.
    {
      id: '20fc4078',
      args: AB,
      files: files('', 'x\n'),
      expectedStdout: 'a.txt:1: EOF\nb.txt:1: x\n',
    },
    // A trailing blank is a difference.
    {
      id: '59599103',
      args: AB,
      files: files('x \n', 'x\n'),
      expectedStdout: 'a.txt:1: x \nb.txt:1: x\n',
    },
    // A blank line against a line of text.
    {
      id: 'f69ba04c',
      args: AB,
      files: files('a\n\nc\n', 'a\nb\nc\n'),
      expectedStdout: 'a.txt:2: \nb.txt:2: b\n',
    },
    // A missing final newline isn't a difference.
    {
      id: '06cd745d',
      args: AB,
      files: files('a\nb', 'a\nb\n'),
      expectedStdout: '',
    },
    // The names come from the arguments.
    {
      id: 'efb60430',
      args: ['new.c', 'old.c'],
      files: [
        { name: 'old.c', content: 'int x;\n' },
        { name: 'new.c', content: 'long x;\n' },
      ],
      expectedStdout: 'new.c:1: long x;\nold.c:1: int x;\n',
    },
    // 1000-character lines differing only in their last character.
    {
      id: '69e52f26',
      args: AB,
      files: files(
        'same\n' + 'x'.repeat(999) + 'a\n',
        'same\n' + 'x'.repeat(999) + 'b\n',
      ),
      expectedStdout:
        'a.txt:2: ' +
        'x'.repeat(999) +
        'a\nb.txt:2: ' +
        'x'.repeat(999) +
        'b\n',
    },
    // 1000 lines, one changed.
    {
      id: '8c70f6f3',
      args: AB,
      files: files(text(LINES), text(CHANGED)),
      expectedStdout:
        'a.txt:777: line 777\nb.txt:777: line seven seven seven\n',
    },
  ],
};
