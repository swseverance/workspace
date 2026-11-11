import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_10: ExerciseSource = {
  id: '1-10',
  chapter: 1,
  number: 10,
  title: 'Make tabs and backspaces visible',
  summary:
    'Copy input to output, replacing each tab, backspace and backslash with its escape sequence. K&R exercise 1-10, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '6db1222b', expectedStdout: '' },
    // Nothing to replace.
    {
      id: 'b1c80b53',
      stdin: 'hello, world\n',
      expectedStdout: 'hello, world\n',
    },
    // A tab.
    { id: '78b3d4c5', stdin: 'a\tb\n', expectedStdout: 'a\\tb\n' },
    // A backspace.
    { id: 'f3f00546', stdin: 'a\bb\n', expectedStdout: 'a\\bb\n' },
    // A backslash.
    { id: 'f637505c', stdin: 'a\\b\n', expectedStdout: 'a\\\\b\n' },
    // Consecutive tabs.
    { id: '946d1907', stdin: '\t\t\n', expectedStdout: '\\t\\t\n' },
    // A backslash followed by t stays distinguishable from a tab.
    { id: '7b5342c3', stdin: 'a\\tb\n', expectedStdout: 'a\\\\tb\n' },
    // Spaces, carriage returns and blank lines are copied unchanged.
    { id: '7dea6854', stdin: 'a b\r\n\n', expectedStdout: 'a b\r\n\n' },
    // No final newline.
    { id: '29cb4c8e', stdin: 'x\ty', expectedStdout: 'x\\ty' },
    // 1,000 each of tabs, backspaces and backslashes.
    {
      id: '5406b8e6',
      stdin: 'a\t\b\\'.repeat(1000) + '\n',
      expectedStdout: 'a\\t\\b\\\\'.repeat(1000) + '\n',
    },
  ],
};
