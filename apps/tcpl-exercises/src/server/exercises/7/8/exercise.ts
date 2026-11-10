import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// "<prefix>1\n" to "<prefix><n>\n".
const lines = (n: number, prefix = 'line ') =>
  Array.from({ length: n }, (_, i) => `${prefix}${i + 1}\n`).join('');

// The description's layout for one file's lines, as pages.
function pages(name: string, text: string, first: boolean): string {
  const all = text
    .split('\n')
    .slice(0, -1)
    .map((line) => `${line}\n`);
  const count = Math.max(1, Math.ceil(all.length / 10));
  return Array.from(
    { length: count },
    (_, p) =>
      (first && p === 0 ? '' : '\f') +
      `${name}  page ${p + 1}\n\n` +
      all.slice(10 * p, 10 * p + 10).join(''),
  ).join('');
}

export const exercise7_8: ExerciseSource = {
  id: '7-8',
  chapter: 7,
  number: 8,
  title: 'Print files with page titles',
  summary:
    'Print a set of files, each starting on a new page, with a title and a running page count for each file. K&R exercise 7-8, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // No files.
    { id: '017aa894', expectedStdout: '' },
    // A short file: one page.
    {
      id: '389733e1',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: 'one\ntwo\nthree\n' }],
      expectedStdout: 'a.txt  page 1\n\none\ntwo\nthree\n',
    },
    // Exactly 10 lines: still one page.
    {
      id: 'f8089f2f',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: lines(10) }],
      expectedStdout: 'a.txt  page 1\n\n' + lines(10),
    },
    // 12 lines: a second page, after a form feed.
    {
      id: '779a4b45',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: lines(12) }],
      expectedStdout:
        'a.txt  page 1\n\n' +
        lines(10) +
        '\fa.txt  page 2\n\nline 11\nline 12\n',
    },
    // Each file starts on a new page, numbered from 1.
    {
      id: 'f209dee2',
      args: ['a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'a\n' },
        { name: 'b.txt', content: 'b\n' },
      ],
      expectedStdout: 'a.txt  page 1\n\na\n\fb.txt  page 1\n\nb\n',
    },
    // Page numbers start again for the next file.
    {
      id: 'a7e0fb0f',
      args: ['a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: lines(11, 'a') },
        { name: 'b.txt', content: lines(11, 'b') },
      ],
      expectedStdout:
        pages('a.txt', lines(11, 'a'), true) +
        pages('b.txt', lines(11, 'b'), false),
    },
    // An empty file gets a page with just its title.
    {
      id: '0736928c',
      args: ['empty.txt', 'a.txt'],
      files: [
        { name: 'empty.txt', content: '' },
        { name: 'a.txt', content: 'a\n' },
      ],
      expectedStdout: 'empty.txt  page 1\n\n\fa.txt  page 1\n\na\n',
    },
    // Blank lines count as lines.
    {
      id: '4cff2a86',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: '\n'.repeat(11) }],
      expectedStdout:
        'a.txt  page 1\n\n' + '\n'.repeat(10) + '\fa.txt  page 2\n\n\n',
    },
    // A last line with no newline gets one.
    {
      id: '5190346b',
      args: ['a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'end' },
        { name: 'b.txt', content: 'b\n' },
      ],
      expectedStdout: 'a.txt  page 1\n\nend\n\fb.txt  page 1\n\nb\n',
    },
    // A 1000-character line is printed whole.
    {
      id: '637c8dd5',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: 'x'.repeat(1000) + '\n' }],
      expectedStdout: 'a.txt  page 1\n\n' + 'x'.repeat(1000) + '\n',
    },
    // 500 lines: 50 pages.
    {
      id: '0dd21ac9',
      args: ['big.txt'],
      files: [{ name: 'big.txt', content: lines(500) }],
      expectedStdout: pages('big.txt', lines(500), true),
    },
  ],
};
