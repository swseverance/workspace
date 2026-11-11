import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Every printable ASCII character, from the blank to the tilde.
const PRINTABLE = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i),
).join('');

export const exercise7_1: ExerciseSource = {
  id: '7-1',
  chapter: 7,
  number: 1,
  title: 'lower or upper by program name',
  summary:
    'Convert the input to lower or upper case depending on the name the program is run as, found in argv[0]. K&R exercise 7-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'ec9bf963', program: 'lower', expectedStdout: '' },
    // Run as lower.
    {
      id: 'bcf5f0b7',
      program: 'lower',
      stdin: 'Hello, World!\n',
      expectedStdout: 'hello, world!\n',
    },
    // Run as upper.
    {
      id: '1c245eac',
      program: 'upper',
      stdin: 'Hello, World!\n',
      expectedStdout: 'HELLO, WORLD!\n',
    },
    // A path before the name.
    {
      id: '20e55b65',
      program: '/usr/local/bin/upper',
      stdin: 'abc\n',
      expectedStdout: 'ABC\n',
    },
    {
      id: 'ffbb282d',
      program: './lower',
      stdin: 'ABC\n',
      expectedStdout: 'abc\n',
    },
    // Any other name copies the input.
    { id: '6d7a1a9c', stdin: 'MiXeD\n', expectedStdout: 'MiXeD\n' },
    // The whole name has to match.
    {
      id: '20534a56',
      program: 'uppercase',
      stdin: 'MiXeD\n',
      expectedStdout: 'MiXeD\n',
    },
    // A directory named upper doesn't count.
    {
      id: 'fb7c56f5',
      program: 'upper/lower',
      stdin: 'MiXeD\n',
      expectedStdout: 'mixed\n',
    },
    // Digits and punctuation are unchanged.
    {
      id: 'cade7a9e',
      program: 'upper',
      stdin: 'a1!b z{\n',
      expectedStdout: 'A1!B Z{\n',
    },
    // Non-ASCII characters pass through.
    {
      id: '52d0863f',
      program: 'upper',
      stdin: 'été\n',
      expectedStdout: 'éTé\n',
    },
    // Several lines, as lower.
    {
      id: 'f5cb013e',
      program: 'lower',
      stdin: 'ONE\n\nTwo\n',
      expectedStdout: 'one\n\ntwo\n',
    },
    // A last line with no newline.
    { id: '2323358f', program: 'upper', stdin: 'end', expectedStdout: 'END' },
    // Every printable ASCII character, 50 times over.
    {
      id: '1e949aab',
      program: 'upper',
      stdin: (PRINTABLE + '\n').repeat(50),
      expectedStdout: (
        PRINTABLE.replace(/[a-z]/g, (ch) => ch.toUpperCase()) + '\n'
      ).repeat(50),
    },
  ],
};
