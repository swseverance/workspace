import { ExerciseSource } from '../../../../models/exercise';
import stdio from '../stdio.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// n bytes of a repeating pattern, ending in a newline.
const bytes = (n: number) =>
  'abcdefghijklmnopqrstuvwxyz0123456789'
    .repeat(Math.ceil(n / 36))
    .slice(0, n - 1) + '\n';

const END = '--\n[end]\n';

export const exercise8_3: ExerciseSource = {
  id: '8-3',
  chapter: 8,
  number: 3,
  title: '_flushbuf, fflush and fclose',
  summary:
    "Write _flushbuf, fflush and fclose for the book's standard I/O library, so output is buffered correctly. K&R exercise 8-3, solved and tested in your browser.",
  description: `${description}\n${stdio}`,
  solution,
  tests: [
    // Empty input: just the appended line.
    { id: 'aae661ec', expectedStdout: END },
    // One line.
    { id: '55ef09f3', stdin: 'hello\n', expectedStdout: 'hello\n' + END },
    // Several lines, including a blank one.
    {
      id: 'f58ef374',
      stdin: 'one\n\nthree\n',
      expectedStdout: 'one\n\nthree\n' + END,
    },
    // Input with no final newline.
    { id: 'd5c2a39b', stdin: 'abc', expectedStdout: 'abc' + END },
    // An existing out.txt is replaced, not added to.
    {
      id: '81d22440',
      stdin: 'new\n',
      files: [{ name: 'out.txt', content: 'old old old old old\n' }],
      expectedStdout: 'new\n' + END,
    },
    // NUL and non-ASCII bytes.
    {
      id: '82860dd8',
      stdin: 'a\0b\tété\n',
      expectedStdout: 'a\0b\tété\n' + END,
    },
    // Exactly one buffer.
    { id: '4e2a1508', stdin: bytes(1024), expectedStdout: bytes(1024) + END },
    // One byte more and one byte less than a buffer.
    { id: 'a94b1eb7', stdin: bytes(1025), expectedStdout: bytes(1025) + END },
    { id: 'cf1a4d40', stdin: bytes(1023), expectedStdout: bytes(1023) + END },
    // 6000 bytes: several buffers each way.
    { id: '84087368', stdin: bytes(6000), expectedStdout: bytes(6000) + END },
  ],
};
