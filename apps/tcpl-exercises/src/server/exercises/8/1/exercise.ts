import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 20,000 bytes: 200 lines of 99 characters and a newline.
const BIG = Array.from(
  { length: 200 },
  (_, i) => String(i).padStart(3, '0') + 'x'.repeat(96) + '\n',
).join('');

export const exercise8_1: ExerciseSource = {
  id: '8-1',
  chapter: 8,
  number: 1,
  title: 'cat with system calls',
  summary:
    'Rewrite cat with the read, write, open and close system calls instead of the standard library. K&R exercise 8-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // No arguments and no input.
    { id: '543ddcb9', expectedStdout: '' },
    // The standard input, with no arguments.
    {
      id: '599d0523',
      stdin: 'hello\nworld\n',
      expectedStdout: 'hello\nworld\n',
    },
    // One file.
    {
      id: '6184b4b0',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: 'from a\n' }],
      expectedStdout: 'from a\n',
    },
    // Files in the order named.
    {
      id: 'e41a2e6a',
      args: ['b.txt', 'a.txt'],
      files: [
        { name: 'a.txt', content: 'from a\n' },
        { name: 'b.txt', content: 'from b\n' },
      ],
      expectedStdout: 'from b\nfrom a\n',
    },
    // The same file twice.
    {
      id: '2b8eeb79',
      args: ['a.txt', 'a.txt'],
      files: [{ name: 'a.txt', content: 'again\n' }],
      expectedStdout: 'again\nagain\n',
    },
    // An empty file between others.
    {
      id: '51550ec3',
      args: ['a.txt', 'empty.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'a\n' },
        { name: 'empty.txt', content: '' },
        { name: 'b.txt', content: 'b\n' },
      ],
      expectedStdout: 'a\nb\n',
    },
    // No newline is added between files.
    {
      id: 'c94c76bc',
      args: ['a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'end' },
        { name: 'b.txt', content: 'start\n' },
      ],
      expectedStdout: 'endstart\n',
    },
    // Every byte is copied, including NUL and non-ASCII ones.
    {
      id: '4f3afdb5',
      args: ['bin.txt'],
      files: [{ name: 'bin.txt', content: 'a\0b\x01\tété\r\n' }],
      expectedStdout: 'a\0b\x01\tété\r\n',
    },
    // With file names, the standard input isn't read.
    {
      id: 'd41d527e',
      args: ['a.txt'],
      stdin: 'not this\n',
      files: [{ name: 'a.txt', content: 'only this\n' }],
      expectedStdout: 'only this\n',
    },
    // Input with no final newline.
    { id: 'e6863e3f', stdin: 'no newline', expectedStdout: 'no newline' },
    // A 20,000-byte file.
    {
      id: '05c80779',
      args: ['big.txt'],
      files: [{ name: 'big.txt', content: BIG }],
      expectedStdout: BIG,
    },
  ],
};
