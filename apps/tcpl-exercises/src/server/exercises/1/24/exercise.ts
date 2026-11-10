import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_24: ExerciseSource = {
  id: '1-24',
  chapter: 1,
  number: 24,
  title: 'Check for unmatched brackets',
  summary:
    'Check a C program for unmatched parentheses, brackets and braces. K&R exercise 1-24, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '354f09fb', expectedStdout: 'ok\n' },
    // Everything matches.
    {
      id: 'cb73fa7d',
      stdin: 'int main() { int a[3]; return (a[0]); }\n',
      expectedStdout: 'ok\n',
    },
    // An extra closing parenthesis.
    {
      id: 'a97ced33',
      stdin: 'f());\n',
      expectedStdout: 'line 1: unmatched )\n',
    },
    // An opener never closed.
    {
      id: 'f342a130',
      stdin: 'int main() {\n  return 0;\n',
      expectedStdout: 'line 1: unmatched {\n',
    },
    // A closer that doesn't match the opener.
    {
      id: '857007bb',
      stdin: 'a = (b];\n',
      expectedStdout: 'line 1: unmatched ]\n',
    },
    // The most recent unclosed opener is reported.
    {
      id: 'c6c42858',
      stdin: '{\n  if (x) {\n    y[1] = 2;\n  }\n',
      expectedStdout: 'line 1: unmatched {\n',
    },
    // Brackets in a comment are ignored.
    { id: '862894e9', stdin: '/* ( [ { */ x = 1;\n', expectedStdout: 'ok\n' },
    // Brackets in a string are ignored.
    { id: '4e96f177', stdin: 'printf("(");\n', expectedStdout: 'ok\n' },
    // An escaped quote inside a string.
    { id: 'f382ba93', stdin: 'printf("\\")(");\n', expectedStdout: 'ok\n' },
    // Character constants, including an escaped quote.
    {
      id: '244eb0bc',
      stdin: "c = '('; d = '\\''; e = ')';\n",
      expectedStdout: 'ok\n',
    },
    // An unterminated comment.
    {
      id: 'cef820ca',
      stdin: 'x = 1;\n/* never\nclosed\n',
      expectedStdout: 'line 2: unterminated comment\n',
    },
    // An unterminated string.
    {
      id: '4d6e6dac',
      stdin: 'printf("hi);\nx = 1;\n',
      expectedStdout: 'line 1: unterminated string\n',
    },
    // An unterminated character constant.
    {
      id: '0c3a5e6d',
      stdin: "c = 'a;\n",
      expectedStdout: 'line 1: unterminated character constant\n',
    },
    // Comment markers inside a string.
    {
      id: 'dabebf0a',
      stdin: 'printf("/*");\n(\n',
      expectedStdout: 'line 2: unmatched (\n',
    },
    // A slash and a star that aren't a comment.
    { id: '56a849b5', stdin: 'x = a / *p;\n', expectedStdout: 'ok\n' },
    // Lines inside a comment are counted.
    {
      id: '308c242f',
      stdin: '/* a\n(\n*/\n)\n',
      expectedStdout: 'line 4: unmatched )\n',
    },
    // 50 levels of nesting.
    {
      id: '58cd1037',
      stdin: '('.repeat(50) + ')'.repeat(50) + '\n',
      expectedStdout: 'ok\n',
    },
    // An error on line 2,001.
    {
      id: '25174a08',
      stdin: '{\n}\n'.repeat(1000) + ')\n',
      expectedStdout: 'line 2001: unmatched )\n',
    },
  ],
};
