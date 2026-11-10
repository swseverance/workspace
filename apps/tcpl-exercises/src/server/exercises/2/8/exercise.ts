import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_8: ExerciseSource = {
  id: '2-8',
  chapter: 2,
  number: 8,
  title: 'Rotate bits right',
  summary:
    'Rotate the bits of an unsigned integer to the right by n positions. K&R exercise 2-8, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '721f25ef', expectedStdout: '' },
    // Bit 0 moves round to the top.
    { id: '413b76a1', stdin: '1 1\n', expectedStdout: '2147483648\n' },
    // A plain shift when no 1-bit falls off.
    { id: 'd183006e', stdin: '2 1\n', expectedStdout: '1\n' },
    // One bit wraps round, one doesn't.
    { id: '0d430d59', stdin: '3 1\n', expectedStdout: '2147483649\n' },
    // 0 and all ones are unchanged.
    {
      id: '7d0bc2ab',
      stdin: '0 5\n4294967295 7\n',
      expectedStdout: '0\n4294967295\n',
    },
    // Hex digits move round: 0x12345678 by 4 and by 8.
    {
      id: '7b7dafbc',
      stdin: '305419896 4\n305419896 8\n',
      expectedStdout: '2166572391\n2014458966\n',
    },
    // Rotating by 0.
    { id: '4122e93a', stdin: '305419896 0\n', expectedStdout: '305419896\n' },
    // Rotating by 31 is rotating left by 1.
    { id: '6cb0760f', stdin: '1 31\n', expectedStdout: '2\n' },
    // Rotating by the word size.
    { id: '008328f5', stdin: '305419896 32\n', expectedStdout: '305419896\n' },
    // Rotating by more than the word size.
    {
      id: '7d767702',
      stdin: '305419896 36\n',
      expectedStdout: '2166572391\n',
    },
    // Several lines, the last with no newline.
    { id: '92d4812f', stdin: '2 1\n1 1', expectedStdout: '1\n2147483648\n' },
    // 1 rotated by each n from 0 to 31.
    {
      id: '6d07705d',
      stdin: Array.from({ length: 32 }, (_, n) => `1 ${n}\n`).join(''),
      expectedStdout: Array.from(
        { length: 32 },
        (_, n) => `${n === 0 ? 1 : 2 ** (32 - n)}\n`,
      ).join(''),
    },
    // The top bit rotated by each n from 0 to 31.
    {
      id: 'd36edb5a',
      stdin: Array.from({ length: 32 }, (_, n) => `2147483648 ${n}\n`).join(''),
      expectedStdout: Array.from(
        { length: 32 },
        (_, n) => `${2 ** (31 - n)}\n`,
      ).join(''),
    },
  ],
};
