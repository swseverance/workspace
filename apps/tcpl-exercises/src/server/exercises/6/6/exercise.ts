import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// V0 to V499 defined as 0 to 499, then all used on one line.
const NUMBERS = Array.from({ length: 500 }, (_, i) => i);
const MANY_IN =
  NUMBERS.map((i) => `#define V${i} ${i}\n`).join('') +
  's = ' +
  NUMBERS.map((i) => `V${i}`).join(' + ') +
  ';\n';
const MANY_OUT = 's = ' + NUMBERS.join(' + ') + ';\n';

// A defined name 1000 times inside a 5000-character string.
const LONG_STRING = '"' + 'N '.repeat(1000) + '" + N\n';

export const exercise6_6: ExerciseSource = {
  id: '6-6',
  chapter: 6,
  number: 6,
  title: 'A simple #define processor',
  summary:
    'Write a simple #define processor without arguments, replacing defined names in a C program. K&R exercise 6-6, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '8d042bfd', expectedStdout: '' },
    // A name replaced; the #define line isn't copied.
    {
      id: '1eb29da1',
      stdin: '#define MAX 100\nint a[MAX];\n',
      expectedStdout: 'int a[100];\n',
    },
    // No #define: the input is copied unchanged.
    {
      id: '7ac8d206',
      stdin: 'int x;\n\tx = 1;\n',
      expectedStdout: 'int x;\n\tx = 1;\n',
    },
    // Tabs and extra blanks around the name.
    {
      id: 'c2242e80',
      stdin: '#define\tTAB  \t8\nx = TAB;\n',
      expectedStdout: 'x = 8;\n',
    },
    // Only whole names are replaced.
    {
      id: '095e4d03',
      stdin: '#define N 10\nint N1 = N + xN + N_;\n',
      expectedStdout: 'int N1 = 10 + xN + N_;\n',
    },
    // Text with blanks in it.
    {
      id: '55675b1e',
      stdin: '#define SQ (x * x)\ny = SQ;\n',
      expectedStdout: 'y = (x * x);\n',
    },
    // Not in strings, character constants or comments.
    {
      id: 'c0d20bf1',
      stdin: '#define N 10\nprintf("N = %d", N); /* N */ c = \'N\';\n',
      expectedStdout: 'printf("N = %d", 10); /* N */ c = \'N\';\n',
    },
    // An escaped quote doesn't end a string.
    {
      id: '497ecada',
      stdin: '#define N 1\ns = "\\"N\\" N"; N\n',
      expectedStdout: 's = "\\"N\\" N"; 1\n',
    },
    // A comment over two lines.
    {
      id: '605ec0bd',
      stdin: '#define N 1\n/* N\nN */ N\n',
      expectedStdout: '/* N\nN */ 1\n',
    },
    // Not before the #define.
    {
      id: '4d969131',
      stdin: 'x = N;\n#define N 1\ny = N;\n',
      expectedStdout: 'x = N;\ny = 1;\n',
    },
    // A later #define replaces an earlier one.
    {
      id: '7ad145de',
      stdin: '#define N 1\na = N;\n#define N 2\nb = N;\n',
      expectedStdout: 'a = 1;\nb = 2;\n',
    },
    // The text isn't scanned again.
    {
      id: '40b00d15',
      stdin: '#define A B\n#define B 1\nx = A + B;\n',
      expectedStdout: 'x = B + 1;\n',
    },
    // An empty text.
    {
      id: '89ebd2bd',
      stdin: '#define DEBUG\nDEBUG x = 1;\n',
      expectedStdout: ' x = 1;\n',
    },
    // Other # lines are copied unchanged; a # later in a line is ordinary.
    {
      id: 'cf5bfbe3',
      stdin: '#define N 5\n#include <N.h>\n#if N\nN # N\n',
      expectedStdout: '#include <N.h>\n#if N\n5 # 5\n',
    },
    // Not in numbers.
    {
      id: '1f13b6ad',
      stdin: '#define e 5\n#define x 7\nd = 1e5 + 0x1F + e;\n',
      expectedStdout: 'd = 1e5 + 0x1F + 5;\n',
    },
    // A last line with no newline.
    { id: 'a5b6ccd5', stdin: '#define N 1\nN', expectedStdout: '1' },
    // 500 names on one line.
    { id: 'a02a7345', stdin: MANY_IN, expectedStdout: MANY_OUT },
    // A long string full of a defined name.
    {
      id: 'b4a6d369',
      stdin: '#define N 1\n' + LONG_STRING,
      expectedStdout: LONG_STRING.replace(/N\n$/, '1\n'),
    },
  ],
};
