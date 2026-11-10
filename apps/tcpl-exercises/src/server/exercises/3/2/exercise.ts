import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise3_2: ExerciseSource = {
  id: '3-2',
  chapter: 3,
  number: 2,
  title: 'Escape sequences and back',
  summary:
    'Turn newlines and tabs into visible escape sequences like \\n and \\t, and back again. K&R exercise 3-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input: two empty strings.
    { id: '13b3e089', expectedStdout: '\n' },
    // Nothing to convert, and no newline.
    { id: '17e943da', stdin: 'hello', expectedStdout: 'hello\nhello' },
    // A final newline.
    { id: '203d70fe', stdin: 'hello\n', expectedStdout: 'hello\\n\nhello\n' },
    // Tabs, one and two in a row.
    {
      id: '223bca46',
      stdin: 'a\tb\t\tc\n',
      expectedStdout: 'a\\tb\\t\\tc\\n\na\tb\t\tc\n',
    },
    // Several lines, including a blank one.
    {
      id: '249a2155',
      stdin: 'one\n\ntwo\n',
      expectedStdout: 'one\\n\\ntwo\\n\none\n\ntwo\n',
    },
    // Blanks stay as they are.
    {
      id: '29ca246d',
      stdin: '  a  b  \n',
      expectedStdout: '  a  b  \\n\n  a  b  \n',
    },
    // Backslashes that don't start a sequence.
    {
      id: '2c3a652f',
      stdin: 'C:\\dir\\file\n',
      expectedStdout: 'C:\\\\dir\\\\file\\n\nC:\\dir\\file\n',
    },
    // Escape sequences typed in the input.
    {
      id: '30dcd3c6',
      stdin: 'x\\ty\\nz\\\\w\n',
      expectedStdout: 'x\\\\ty\\\\nz\\\\\\\\w\\n\nx\ty\nz\\w\n',
    },
    // An escaped backslash followed by n is a backslash and an n.
    {
      id: '32e41111',
      stdin: 'a\\\\nb\n',
      expectedStdout: 'a\\\\\\\\nb\\n\na\\nb\n',
    },
    // A backslash at the very end.
    { id: '345ffa0d', stdin: 'end\\', expectedStdout: 'end\\\\\nend\\' },
    // A backslash just before a newline.
    { id: '362eb88d', stdin: 'a\\\nb', expectedStdout: 'a\\\\\\nb\na\\\nb' },
    // 3000 backslashes: escaping doubles them, the reverse halves them.
    {
      id: '3869ca11',
      stdin: '\\'.repeat(3000),
      expectedStdout: '\\'.repeat(6000) + '\n' + '\\'.repeat(1500),
    },
  ],
};
