import { ExerciseSource } from '../../../../models/exercise';
import undcl from '../undcl.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// x, then 20 rounds of "pointer to function returning", which needs the
// parentheses every time.
let nested = 'x';
for (let i = 0; i < 20; i++) {
  nested = `(*${nested})()`;
}

export const exercise5_19: ExerciseSource = {
  id: '5-19',
  chapter: 5,
  number: 19,
  title: 'undcl without redundant parentheses',
  summary:
    'Make undcl, which turns words back into C declarations, add only the parentheses it needs. K&R exercise 5-19, solved and tested in your browser.',
  description: `${description}\n${undcl}`,
  solution,
  tests: [
    // Empty input.
    { id: '31d4758f', expectedStdout: '' },
    // A pointer needs no parentheses.
    { id: '710c7b95', stdin: 'x * char\n', expectedStdout: 'char *x\n' },
    // Nor does a pointer to a pointer.
    { id: '63274997', stdin: 'x * * char\n', expectedStdout: 'char **x\n' },
    // An array of pointers.
    { id: 'fc4d5b79', stdin: 'x [] * char\n', expectedStdout: 'char *x[]\n' },
    // A pointer to an array needs them.
    { id: 'bfd59243', stdin: 'x * [] char\n', expectedStdout: 'char (*x)[]\n' },
    // A function returning a pointer.
    { id: '06dd4588', stdin: 'x () * char\n', expectedStdout: 'char *x()\n' },
    // A pointer to a function needs them.
    { id: '05a46171', stdin: 'x * () char\n', expectedStdout: 'char (*x)()\n' },
    // The book's example, where every pair is needed.
    {
      id: 'b07a556a',
      stdin: 'x () * [] * () char\n',
      expectedStdout: 'char (*(*x())[])()\n',
    },
    // Two pointers before a function share one pair.
    {
      id: 'aa803f24',
      stdin: 'x * * () char\n',
      expectedStdout: 'char (**x)()\n',
    },
    // Arrays with sizes.
    {
      id: 'c863881a',
      stdin: 'daytab [2] [13] char\ndaytab * [13] int\n',
      expectedStdout: 'char daytab[2][13]\nint (*daytab)[13]\n',
    },
    // A plain variable.
    { id: 'd7cd562d', stdin: 'x int\n', expectedStdout: 'int x\n' },
    // A last line with no newline.
    {
      id: '9d0c3216',
      stdin: 'x int\np * char',
      expectedStdout: 'int x\nchar *p\n',
    },
    // 30 pointers, then 20 nested pointers to functions.
    {
      id: 'accf183e',
      stdin: 'x' + ' *'.repeat(30) + ' char\nx' + ' * ()'.repeat(20) + ' int\n',
      expectedStdout: 'char ' + '*'.repeat(30) + 'x\nint ' + nested + '\n',
    },
  ],
};
