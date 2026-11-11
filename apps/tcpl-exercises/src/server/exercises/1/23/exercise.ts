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
    // Empty input.
    { id: '03e01b86', expectedStdout: '' },
    // No comments.
    { id: 'ed2a05c8', stdin: 'int x;\n', expectedStdout: 'int x;\n' },
    // A comment at the end of a line.
    {
      id: '8349402b',
      stdin: 'int x; /* count */\n',
      expectedStdout: 'int x; \n',
    },
    // A comment on its own line.
    {
      id: 'e670ec50',
      stdin: '/* header */\nint x;\n',
      expectedStdout: '\nint x;\n',
    },
    // A comment across lines.
    { id: '732b949b', stdin: 'a /* one\ntwo */ b\n', expectedStdout: 'a  b\n' },
    // Comment markers inside a string.
    {
      id: 'c6e09545',
      stdin: 'printf("/* hi */");\n',
      expectedStdout: 'printf("/* hi */");\n',
    },
    // An escaped quote inside a string.
    {
      id: 'c1e52180',
      stdin: 'printf("\\" /* x */ \\"");\n',
      expectedStdout: 'printf("\\" /* x */ \\"");\n',
    },
    // A double quote as a character constant.
    {
      id: 'a9aa5b0d',
      stdin: "c = '\"'; /* q */\n",
      expectedStdout: "c = '\"'; \n",
    },
    // An escaped single quote as a character constant.
    {
      id: '603b1834',
      stdin: "c = '\\''; /* q */ d = 1;\n",
      expectedStdout: "c = '\\'';  d = 1;\n",
    },
    // A string ending in an escaped backslash.
    {
      id: 'aafce122',
      stdin: 's = "\\\\"; /* x */\n',
      expectedStdout: 's = "\\\\"; \n',
    },
    // Comments don't nest.
    { id: '40ce9a2b', stdin: '/* a /* b */ c */\n', expectedStdout: ' c */\n' },
    // A slash and a star that aren't a comment.
    {
      id: 'c2281bc4',
      stdin: 'x = a / b * c;\n',
      expectedStdout: 'x = a / b * c;\n',
    },
    // An empty comment between two words.
    { id: '6fc24b9e', stdin: 'a/**/b\n', expectedStdout: 'ab\n' },
    // 500 lines with comments.
    {
      id: '710cdb70',
      stdin: 'x = 1; /* c */\n'.repeat(500),
      expectedStdout: 'x = 1; \n'.repeat(500),
    },
    // A 10,000-character comment.
    {
      id: 'd7414da5',
      stdin: 'a /*' + 'z'.repeat(10_000) + '*/ b\n',
      expectedStdout: 'a  b\n',
    },
  ],
};
