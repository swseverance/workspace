import { ExerciseSource } from '../../../../models/exercise';
import dcl from '../dcl.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// A parameter that's a pointer to a function taking a parameter that's a
// pointer to a function taking ... 20 levels deep, and its description.
let param = 'int';
let words = 'int';
for (let i = 0; i < 20; i++) {
  param = `int (*)(${param})`;
  words = `pointer to function taking (${words}) returning int`;
}

export const exercise5_20: ExerciseSource = {
  id: '5-20',
  chapter: 5,
  number: 20,
  title: 'dcl with parameters and qualifiers',
  summary:
    'Expand dcl, which turns C declarations into words, to handle parameter types and const. K&R exercise 5-20, solved and tested in your browser.',
  description: `${description}\n${dcl}`,
  solution,
  tests: [
    // Empty input.
    { id: '172771c2', expectedStdout: '' },
    // Declarations dcl already handled.
    {
      id: '26494744',
      stdin: 'int x\nchar (*(*x())[])()\n',
      expectedStdout:
        'x:  int\n' +
        'x:  function returning pointer to array[] of pointer to function returning char\n',
    },
    // const before the data type.
    {
      id: '3081f93c',
      stdin: 'const char *s\n',
      expectedStdout: 's:  pointer to const char\n',
    },
    // volatile, and both qualifiers.
    {
      id: '5941fc55',
      stdin: 'volatile int v\nconst volatile int cv\n',
      expectedStdout: 'v:  volatile int\ncv:  const volatile int\n',
    },
    // One parameter.
    {
      id: 'f37ae445',
      stdin: 'int f(int)\n',
      expectedStdout: 'f:  function taking (int) returning int\n',
    },
    // Named parameters.
    {
      id: '402c7ddf',
      stdin: 'int f(char *s, int n)\n',
      expectedStdout:
        'f:  function taking (pointer to char, int) returning int\n',
    },
    // Unnamed parameters, with const.
    {
      id: 'db1485bd',
      stdin: 'char *strcpy(char *, const char *)\n',
      expectedStdout:
        'strcpy:  function taking (pointer to char, pointer to const char) returning pointer to char\n',
    },
    // An array parameter.
    {
      id: '327f30a3',
      stdin: 'int main(int argc, char *argv[])\n',
      expectedStdout:
        'main:  function taking (int, array[] of pointer to char) returning int\n',
    },
    // A pointer-to-function parameter with its own parameters.
    {
      id: '801934d5',
      stdin:
        'void qsort(void *v[], int left, int right, int (*comp)(void *, void *))\n',
      expectedStdout:
        'qsort:  function taking (array[] of pointer to void, int, int, pointer to function taking (pointer to void, pointer to void) returning int) returning void\n',
    },
    // An unnamed pointer-to-function parameter.
    {
      id: '748ba84f',
      stdin: 'void signal(int, void (*)(int))\n',
      expectedStdout:
        'signal:  function taking (int, pointer to function taking (int) returning void) returning void\n',
    },
    // A pointer to a function with parameters.
    {
      id: '2e0c1bbd',
      stdin: 'int *(*fp)(const char *)\n',
      expectedStdout:
        'fp:  pointer to function taking (pointer to const char) returning pointer to int\n',
    },
    // Empty parentheses.
    {
      id: '084f0698',
      stdin: 'int f()\n',
      expectedStdout: 'f:  function returning int\n',
    },
    // A last line with no newline.
    { id: '69f41de1', stdin: 'const int c', expectedStdout: 'c:  const int\n' },
    // Parameters nested 20 deep.
    {
      id: 'fb36fcbf',
      stdin: `void f(${param})\n`,
      expectedStdout: `f:  function taking (${words}) returning void\n`,
    },
  ],
};
