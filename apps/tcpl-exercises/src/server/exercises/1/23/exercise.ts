import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_23: ExerciseSource = {
  id: '1-23',
  chapter: 1,
  number: 23,
  title: 'Remove comments',
  summary:
    'Remove the comments from a C program, leaving strings and character constants intact. K&R exercise 1-23, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // No comments.
    {
      id: 'f0c414e9',
      stdin: 'int main(void) {\n' + '  return 0;\n' + '}\n',
      expectedStdout: 'int main(void) {\n' + '  return 0;\n' + '}\n',
    },
    // A comment at the end of a line.
    {
      id: '70f078eb',
      stdin: 'int main(void) {\n' + '  return 0; /* done */\n' + '}\n',
      expectedStdout: 'int main(void) {\n' + '  return 0; \n' + '}\n',
    },
    // A comment on its own line.
    {
      id: 'e788eb4a',
      stdin: '/* header */\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
      expectedStdout: '\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
    },
    // A comment across lines.
    {
      id: '301f2d7b',
      stdin:
        'int main(void) {\n' +
        '  int x = 1; /* one\n' +
        '  two */\n' +
        '  return x;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' + '  int x = 1; \n' + '  return x;\n' + '}\n',
    },
    // Comment markers inside a string.
    {
      id: '3e739dea',
      stdin:
        '#include <stdio.h>\n' +
        '\n' +
        'int main(void) {\n' +
        '  printf("/* hi */\\n");\n' +
        '  return 0;\n' +
        '}\n',
      expectedStdout:
        '#include <stdio.h>\n' +
        '\n' +
        'int main(void) {\n' +
        '  printf("/* hi */\\n");\n' +
        '  return 0;\n' +
        '}\n',
    },
    // An escaped quote inside a string.
    {
      id: 'ee5d56be',
      stdin:
        '#include <stdio.h>\n' +
        '\n' +
        'int main(void) {\n' +
        '  printf("\\" /* x */ \\"\\n");\n' +
        '  return 0;\n' +
        '}\n',
      expectedStdout:
        '#include <stdio.h>\n' +
        '\n' +
        'int main(void) {\n' +
        '  printf("\\" /* x */ \\"\\n");\n' +
        '  return 0;\n' +
        '}\n',
    },
    // A double quote as a character constant.
    {
      id: '0782848b',
      stdin:
        'int main(void) {\n' +
        "  int c = '\"'; /* q */\n" +
        '  return c;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' + "  int c = '\"'; \n" + '  return c;\n' + '}\n',
    },
    // An escaped single quote as a character constant.
    {
      id: '07c68c8a',
      stdin:
        'int main(void) {\n' +
        "  int c = '\\''; /* q */ int d = 1;\n" +
        '  return c + d;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        "  int c = '\\'';  int d = 1;\n" +
        '  return c + d;\n' +
        '}\n',
    },
    // A backslash as a character constant.
    {
      id: 'cc36e762',
      stdin:
        'int main(void) {\n' +
        "  int c = '\\\\'; /* b */\n" +
        '  return c;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' + "  int c = '\\\\'; \n" + '  return c;\n' + '}\n',
    },
    // An escaped backslash and then an escaped quote inside a string.
    {
      id: 'd4b92c45',
      stdin:
        'int main(void) {\n' +
        '  char *s = "\\\\\\" /* a */"; /* b */\n' +
        '  return s[0];\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  char *s = "\\\\\\" /* a */"; \n' +
        '  return s[0];\n' +
        '}\n',
    },
    // A string ending in an escaped backslash.
    {
      id: '339a898e',
      stdin:
        'int main(void) {\n' +
        '  char *s = "\\\\"; /* x */\n' +
        '  return s[0];\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  char *s = "\\\\"; \n' +
        '  return s[0];\n' +
        '}\n',
    },
    // A comment that has a slash and a star right before it ends.
    {
      id: 'de86cf16',
      stdin: '/* a /*/\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
      expectedStdout: '\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
    },
    // Comments don't nest.
    {
      id: 'ac8576ea',
      stdin: '/* a /* b */\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
      expectedStdout: '\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
    },
    // A slash and a star that aren't a comment.
    {
      id: '6d13247c',
      stdin:
        'int main(void) {\n' +
        '  int a = 6, b = 3, c = 2;\n' +
        '  return a / b * c;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  int a = 6, b = 3, c = 2;\n' +
        '  return a / b * c;\n' +
        '}\n',
    },
    // An empty comment.
    {
      id: '52c08624',
      stdin:
        'int main(void) {\n' + '  int x = 1/**/+2;\n' + '  return x;\n' + '}\n',
      expectedStdout:
        'int main(void) {\n' + '  int x = 1+2;\n' + '  return x;\n' + '}\n',
    },
    // A character constant right after a slash.
    {
      id: '0bf6cb62',
      stdin:
        'int main(void) {\n' +
        '  int x = 68;\n' +
        "  int y = x/'\"'; /* c */\n" +
        '  return y;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  int x = 68;\n' +
        "  int y = x/'\"'; \n" +
        '  return y;\n' +
        '}\n',
    },
    // A star right after a comment.
    {
      id: 'cb3ff512',
      stdin:
        'int main(void) {\n' +
        '  int v = 1;\n' +
        '  int *p = &v;\n' +
        '  int x = /* a */*p;\n' +
        '  return x;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  int v = 1;\n' +
        '  int *p = &v;\n' +
        '  int x = *p;\n' +
        '  return x;\n' +
        '}\n',
    },
    // The star that opens a comment can't also close it.
    {
      id: 'ccf1964d',
      stdin:
        'int main(void) {\n' +
        '  int a = 1, c = 2;\n' +
        '  int x = a /*/ b */ + c;\n' +
        '  return x;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  int a = 1, c = 2;\n' +
        '  int x = a  + c;\n' +
        '  return x;\n' +
        '}\n',
    },
    // Several stars before the closing slash.
    {
      id: 'de3370ac',
      stdin:
        'int main(void) {\n' +
        '  int a = 1, c = 2;\n' +
        '  int x = a /***/ + c;\n' +
        '  return x;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  int a = 1, c = 2;\n' +
        '  int x = a  + c;\n' +
        '  return x;\n' +
        '}\n',
    },
    // A backslash in a comment escapes nothing.
    {
      id: '16b689d0',
      stdin:
        'int main(void) {\n' +
        '  int a = 1, c = 2;\n' +
        '  int x = a /* \\*/ + c;\n' +
        '  return x;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' +
        '  int a = 1, c = 2;\n' +
        '  int x = a  + c;\n' +
        '  return x;\n' +
        '}\n',
    },
    // Quotes in a comment don't start a string or a character constant.
    {
      id: 'b9adb62d',
      stdin:
        'int main(void) {\n' +
        '  /* it\'s 5" wide */ int x = 5;\n' +
        '  return x;\n' +
        '}\n',
      expectedStdout:
        'int main(void) {\n' + '   int x = 5;\n' + '  return x;\n' + '}\n',
    },
    // A program of 1,000 characters, the longest allowed.
    {
      id: '679c93b7',
      stdin:
        '/*' +
        'z'.repeat(964) +
        '*/\n' +
        'int main(void) {\n' +
        '  return 0;\n' +
        '}\n',
      expectedStdout: '\n' + 'int main(void) {\n' + '  return 0;\n' + '}\n',
    },
  ],
};
