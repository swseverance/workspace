import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const LOOP = 'for (i = 0; i < n; i++) /* while */ s = "if";\n';

export const exercise6_1: ExerciseSource = {
  id: '6-1',
  chapter: 6,
  number: 1,
  title: 'A better getword',
  summary:
    'Improve getword to handle underscores, strings, comments and preprocessor lines, then count C keywords. K&R exercise 6-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'c2c89a71', expectedStdout: '' },
    // A small function, keywords in alphabetical order.
    {
      id: '05d3c1e7',
      stdin: 'int main(void) { return 0; }\n',
      expectedStdout: '   1 int\n   1 return\n   1 void\n',
    },
    // Counting repeats.
    {
      id: 'ba670e91',
      stdin: 'int x; int y; char c;\n',
      expectedStdout: '   1 char\n   2 int\n',
    },
    // Underscores are part of names.
    {
      id: 'fbee934c',
      stdin: 'int my_int, _if, if_x, do_while;\n',
      expectedStdout: '   1 int\n',
    },
    // Keywords inside a string, including after an escaped quote.
    {
      id: 'a9782db2',
      stdin: 'printf("int while for\\n"); s = "a \\" if"; char c;\n',
      expectedStdout: '   1 char\n',
    },
    // A quote inside a character constant doesn't start a string.
    {
      id: '488c000e',
      stdin: "char q = '\"'; char b = '\\''; int i;\n",
      expectedStdout: '   2 char\n   1 int\n',
    },
    // Comments, on one line and over two.
    {
      id: 'a1466912',
      stdin: '/* int while */ char c; /* multi\nline if */ return;\n',
      expectedStdout: '   1 char\n   1 return\n',
    },
    // A comment inside a string, and a string inside a comment.
    {
      id: 'a4cd2cc8',
      stdin: 's = "/* not a comment */"; int x; /* "if" else */\n',
      expectedStdout: '   1 int\n',
    },
    // Preprocessor control lines, including indented ones.
    {
      id: 'd0166600',
      stdin:
        '#include <stdio.h>\n#define MAX int\n#if defined(X)\nint x;\n  #else\nchar c;\n#endif\n',
      expectedStdout: '   1 char\n   1 int\n',
    },
    // A # later in a line isn't a control line.
    {
      id: 'cdde8692',
      stdin: 'x = 1; # int\n',
      expectedStdout: '   1 int\n',
    },
    // Keywords must be whole words.
    {
      id: '68457d8d',
      stdin: 'integer interrupt doubled do double\n',
      expectedStdout: '   1 do\n   1 double\n',
    },
    // The letters in numbers aren't words.
    {
      id: '98bffbd9',
      stdin: 'x = 0xfor + 1e5 + 3do; long y;\n',
      expectedStdout: '   1 long\n',
    },
    // A last line with no newline.
    { id: 'e57d4a1e', stdin: 'int x', expectedStdout: '   1 int\n' },
    // A name longer than the word buffer is still one name.
    {
      id: 'b44d7029',
      stdin: 'x'.repeat(99) + 'int = 1;\n',
      expectedStdout: '',
    },
    // A 5000-character string and comment, then 1000 lines of loops.
    {
      id: 'c0b92642',
      stdin:
        'char s[] = "' +
        'if '.repeat(1666) +
        '"; /* ' +
        'else '.repeat(1000) +
        ' */ int i;\n' +
        LOOP.repeat(1000),
      expectedStdout: '   1 char\n1000 for\n   1 int\n',
    },
  ],
};
