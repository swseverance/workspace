import { ExerciseSource } from '../../../../models/exercise';
import dcl from '../dcl.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 150 pairs of a bad line, missing its ], and a good one.
const PAIRS = Array.from({ length: 150 }, (_, k) => k + 1);

// x wrapped in 40 levels of (* ... ).
const DEEP = 'int ' + '(*'.repeat(40) + 'x' + ')'.repeat(40) + '\n';

export const exercise5_18: ExerciseSource = {
  id: '5-18',
  chapter: 5,
  number: 18,
  title: 'dcl that recovers from errors',
  summary:
    'Make dcl, which turns C declarations into words, recover from input errors and carry on. K&R exercise 5-18, solved and tested in your browser.',
  description: `${description}\n${dcl}`,
  solution,
  tests: [
    // Empty input.
    { id: 'd47b7ffb', expectedStdout: '' },
    // A simple declaration.
    { id: '02b76e0a', stdin: 'int x\n', expectedStdout: 'x:  int\n' },
    // The book's examples.
    {
      id: '5b132ca9',
      stdin:
        'char **argv\nint (*daytab)[13]\nvoid (*comp)()\nchar (*(*x())[])()\n',
      expectedStdout:
        'argv:  pointer to pointer to char\n' +
        'daytab:  pointer to array[13] of int\n' +
        'comp:  pointer to function returning void\n' +
        'x:  function returning pointer to array[] of pointer to function returning char\n',
    },
    // A missing ).
    {
      id: '45daaace',
      stdin: 'int (*x\nint y\n',
      expectedStdout: 'syntax error\ny:  int\n',
    },
    // An extra ).
    {
      id: '5c64f62d',
      stdin: 'int x)\nint (x))\nint y\n',
      expectedStdout: 'syntax error\nsyntax error\ny:  int\n',
    },
    // No name.
    {
      id: '68e6b99c',
      stdin: 'int *\nint\nint y\n',
      expectedStdout: 'syntax error\nsyntax error\ny:  int\n',
    },
    // Extra tokens at the end of a line.
    {
      id: 'e176af26',
      stdin: 'int x y\nchar c\n',
      expectedStdout: 'syntax error\nc:  char\n',
    },
    // A missing ] doesn't swallow the next line.
    {
      id: 'bd94e597',
      stdin: 'int a[10\nchar c\n',
      expectedStdout: 'syntax error\nc:  char\n',
    },
    // Something other than a name where one is needed.
    {
      id: 'ab7ecba6',
      stdin: 'int 3x\n* x\nint y\n',
      expectedStdout: 'syntax error\nsyntax error\ny:  int\n',
    },
    // A blank line.
    {
      id: '0b7ef733',
      stdin: '\nint z\n',
      expectedStdout: 'syntax error\nz:  int\n',
    },
    // A last line with no newline.
    {
      id: '2294abf3',
      stdin: 'int x\nchar *p',
      expectedStdout: 'x:  int\np:  pointer to char\n',
    },
    // A last line with an error and no newline.
    {
      id: '82bb5e19',
      stdin: 'int x\nint (',
      expectedStdout: 'x:  int\nsyntax error\n',
    },
    // 300 lines, every other one bad.
    {
      id: '1aab4283',
      stdin: PAIRS.map((k) => `int a${k}[5\nint *a${k}[5]\n`).join(''),
      expectedStdout: PAIRS.map(
        (k) => `syntax error\na${k}:  array[5] of pointer to int\n`,
      ).join(''),
    },
    // 40 levels of parentheses.
    {
      id: '189f86b7',
      stdin: DEEP,
      expectedStdout: 'x: ' + ' pointer to'.repeat(40) + ' int\n',
    },
  ],
};
