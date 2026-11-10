import { ExerciseSource } from '../../../../models/exercise';
import stdio from '../stdio.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// n bytes of a repeating pattern, ending in a newline.
const bytes = (n: number) =>
  'abcdefghijklmnopqrstuvwxyz0123456789'
    .repeat(Math.ceil(n / 36))
    .slice(0, n - 1) + '\n';

// 17 files: every slot in _iob after stdin, stdout and stderr.
const MANY = Array.from({ length: 17 }, (_, i) => ({
  name: `f${i}.txt`,
  content: `file ${i}\n`,
}));

export const exercise8_2: ExerciseSource = {
  id: '8-2',
  chapter: 8,
  number: 2,
  title: 'fopen with fields',
  summary:
    "Rewrite fopen and _fillbuf from the book's standard I/O library with bit-fields instead of bit operations. K&R exercise 8-2, solved and tested in your browser.",
  description: `${description}\n${stdio}`,
  solution,
  tests: [
    // No files.
    { id: '666633ef', expectedStdout: '' },
    // One file.
    {
      id: 'd8561325',
      args: ['a.txt'],
      files: [{ name: 'a.txt', content: 'hello\nworld\n' }],
      expectedStdout: 'hello\nworld\n',
    },
    // Files in the order named, and the same one twice.
    {
      id: '5b774f6e',
      args: ['b.txt', 'a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'a\n' },
        { name: 'b.txt', content: 'b\n' },
      ],
      expectedStdout: 'b\na\nb\n',
    },
    // An empty file.
    {
      id: '122dbf80',
      args: ['empty.txt', 'a.txt'],
      files: [
        { name: 'empty.txt', content: '' },
        { name: 'a.txt', content: 'a\n' },
      ],
      expectedStdout: 'a\n',
    },
    // A file with no final newline, then another.
    {
      id: 'b31d8794',
      args: ['a.txt', 'b.txt'],
      files: [
        { name: 'a.txt', content: 'end' },
        { name: 'b.txt', content: 'start\n' },
      ],
      expectedStdout: 'endstart\n',
    },
    // NUL and non-ASCII bytes.
    {
      id: '0a51dfec',
      args: ['bin.txt'],
      files: [{ name: 'bin.txt', content: 'a\0b\tété\n' }],
      expectedStdout: 'a\0b\tété\n',
    },
    // Exactly one buffer, one byte more, and one byte less.
    {
      id: 'd2cf23f7',
      args: ['a.txt', 'b.txt', 'c.txt'],
      files: [
        { name: 'a.txt', content: bytes(1024) },
        { name: 'b.txt', content: bytes(1025) },
        { name: 'c.txt', content: bytes(1023) },
      ],
      expectedStdout: bytes(1024) + bytes(1025) + bytes(1023),
    },
    // 17 files open at once.
    {
      id: '983c046b',
      args: MANY.map((file) => file.name),
      files: MANY,
      expectedStdout: MANY.map((file) => file.content).join(''),
    },
    // A 6000-byte file: several buffers.
    {
      id: '2be77ab4',
      args: ['big.txt'],
      files: [{ name: 'big.txt', content: bytes(6000) }],
      expectedStdout: bytes(6000),
    },
  ],
};
