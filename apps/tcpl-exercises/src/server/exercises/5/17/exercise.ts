import { ExerciseSource } from '../../../../models/exercise';
import sort from '../sort.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// A letter and a number on each line, every number different, sorted by
// letter, then numerically by number.
const ROWS = Array.from({ length: 1000 }, (_, k) => ({
  letter: String.fromCharCode(97 + (k % 26)),
  number: (k * 37) % 1000,
}));
const SORTED = [...ROWS].sort(
  (a, b) => a.letter.localeCompare(b.letter) || a.number - b.number,
);
const text = (rows: typeof ROWS) =>
  rows.map((row) => `${row.letter} ${row.number}\n`).join('');

export const exercise5_17: ExerciseSource = {
  id: '5-17',
  chapter: 5,
  number: 17,
  title: 'sort on fields',
  summary:
    'Add fields to the sort program, so lines can be sorted on fields within them, each with its own options. K&R exercise 5-17, solved and tested in your browser.',
  description: `${description}\n${sort}`,
  solution,
  tests: [
    // Empty input.
    { id: 'bf9c5125', args: ['+1'], expectedStdout: '' },
    // No keys: whole lines.
    { id: '79a9ebb8', stdin: 'b 1\na 2\n', expectedStdout: 'a 2\nb 1\n' },
    // A second field, as text.
    {
      id: 'df636806',
      args: ['+2'],
      stdin: 'x b\ny a\n',
      expectedStdout: 'y a\nx b\n',
    },
    // A second field, numerically.
    {
      id: 'bef7a111',
      args: ['+2n'],
      stdin: 'a 10\nb 9\nc 100\n',
      expectedStdout: 'b 9\na 10\nc 100\n',
    },
    // A second field, numerically and in reverse.
    {
      id: '61abe17b',
      args: ['+2nr'],
      stdin: 'a 10\nb 9\nc 100\n',
      expectedStdout: 'c 100\na 10\nb 9\n',
    },
    // Two keys: the second breaks ties in the first.
    {
      id: 'f643f645',
      args: ['+1', '+2n'],
      stdin: 'b 2\na 10\na 9\nb 1\n',
      expectedStdout: 'a 9\na 10\nb 1\nb 2\n',
    },
    // Each key has its own options.
    {
      id: '7560b306',
      args: ['+1r', '+2n'],
      stdin: 'b 2\na 10\na 9\nb 1\n',
      expectedStdout: 'b 1\nb 2\na 9\na 10\n',
    },
    // The book's index: -df for the entries, -n for the page numbers.
    {
      id: 'c13276ef',
      args: ['+1df', '+2n'],
      stdin: 'Pointers 99\n(pointer) 12\npointer 3\nArrays 5\n',
      expectedStdout: 'Arrays 5\npointer 3\n(pointer) 12\nPointers 99\n',
    },
    // Fields separated by several blanks and tabs.
    {
      id: 'c70ea6bc',
      args: ['+2n'],
      stdin: 'a   3\nb\t1\nc  \t 2\n',
      expectedStdout: 'b\t1\nc  \t 2\na   3\n',
    },
    // A missing field is empty.
    {
      id: '90368821',
      args: ['+2'],
      stdin: 'a x\nb\nc w\n',
      expectedStdout: 'b\nc w\na x\n',
    },
    // Blanks before the first field.
    {
      id: 'f023ebc2',
      args: ['+1'],
      stdin: ' b\na\n',
      expectedStdout: 'a\n b\n',
    },
    // A last line with no newline.
    {
      id: 'e4eb8c37',
      args: ['+2n'],
      stdin: 'a 2\nb 1',
      expectedStdout: 'b 1\na 2\n',
    },
    // 1000 lines on two keys.
    {
      id: '98948a13',
      args: ['+1', '+2n'],
      stdin: text(ROWS),
      expectedStdout: text(SORTED),
    },
  ],
};
