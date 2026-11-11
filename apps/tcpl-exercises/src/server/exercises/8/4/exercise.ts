import { ExerciseSource } from '../../../../models/exercise';
import stdio from '../stdio.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// A 21-character file: positions 0 to 9 are digits, 10 to 19 are a to j.
const FILE = [{ name: 'f.txt', content: '0123456789abcdefghij\n' }];

// 10,000 characters: "0000|0001|...", so every position is different.
const BIG = Array.from(
  { length: 2000 },
  (_, k) => String(k).padStart(4, '0') + '|',
).join('');

// 100 seeks of each kind around BIG, and what they read: the description's
// rules, simulated.
const SEEKS = Array.from({ length: 100 }, (_, i) => {
  const origin = i % 3;
  const offset =
    origin === 0
      ? (i * 997) % 10000
      : origin === 1
        ? ((i * 37) % 400) - 200
        : -(1 + ((i * 53) % 9999));
  return { origin, offset, count: 1 + ((i * 13) % 40) };
});
let position = 0;
const SEEKS_OUT = SEEKS.map(({ origin, offset, count }) => {
  const target =
    origin === 0
      ? offset
      : origin === 1
        ? position + offset
        : BIG.length + offset;
  if (target < 0) {
    return 'error\n';
  }
  const text = BIG.slice(target, target + count);
  position = target + text.length;
  return text + '\n';
}).join('');

export const exercise8_4: ExerciseSource = {
  id: '8-4',
  chapter: 8,
  number: 4,
  title: 'fseek',
  summary:
    "Write fseek for the book's standard I/O library, working properly with its buffering. K&R exercise 8-4, solved and tested in your browser.",
  description: `${description}\n${stdio}`,
  solution,
  tests: [
    // No seeks.
    { id: 'b70794d1', args: ['f.txt'], files: FILE, expectedStdout: '' },
    // From the start.
    {
      id: '457e55ee',
      args: ['f.txt', '0', '5', '3'],
      files: FILE,
      expectedStdout: '567\n',
    },
    // Backwards and forwards from the start.
    {
      id: '4ce088a3',
      args: ['f.txt', '0', '10', '2', '0', '2', '2'],
      files: FILE,
      expectedStdout: 'ab\n23\n',
    },
    // From the current position, which is behind the buffer.
    {
      id: '874405d6',
      args: ['f.txt', '0', '0', '3', '1', '2', '3'],
      files: FILE,
      expectedStdout: '012\n567\n',
    },
    // Back from the current position.
    {
      id: '23ac7ce7',
      args: ['f.txt', '0', '10', '2', '1', '-5', '2'],
      files: FILE,
      expectedStdout: 'ab\n78\n',
    },
    // An offset of 0 from the current position at the start.
    {
      id: '7e656b23',
      args: ['f.txt', '1', '0', '3'],
      files: FILE,
      expectedStdout: '012\n',
    },
    // From the end.
    {
      id: 'b2f7c998',
      args: ['f.txt', '2', '-4', '3'],
      files: FILE,
      expectedStdout: 'hij\n',
    },
    // Reading runs out at the end of the file.
    {
      id: 'd184d7a9',
      args: ['f.txt', '0', '19', '5'],
      files: FILE,
      expectedStdout: 'j\n\n',
    },
    // A seek after reaching the end reads again.
    {
      id: 'b0794b95',
      args: ['f.txt', '0', '0', '30', '0', '0', '3'],
      files: FILE,
      expectedStdout: '0123456789abcdefghij\n\n012\n',
    },
    // Before the start is an error, and the position doesn't change.
    {
      id: '4b892f40',
      args: [
        'f.txt',
        '0',
        '4',
        '2',
        '0',
        '-1',
        '3',
        '1',
        '-10',
        '1',
        '1',
        '0',
        '2',
      ],
      files: FILE,
      expectedStdout: '45\nerror\nerror\n67\n',
    },
    // Past the end reads nothing.
    {
      id: '7fc3f0ad',
      args: ['f.txt', '0', '100', '3', '2', '-1', '1'],
      files: FILE,
      expectedStdout: '\n\n\n',
    },
    // 100 seeks around a 10,000-character file.
    {
      id: '19b578e2',
      args: [
        'big.txt',
        ...SEEKS.flatMap(({ origin, offset, count }) => [
          `${origin}`,
          `${offset}`,
          `${count}`,
        ]),
      ],
      files: [{ name: 'big.txt', content: BIG }],
      expectedStdout: SEEKS_OUT,
    },
  ],
};
