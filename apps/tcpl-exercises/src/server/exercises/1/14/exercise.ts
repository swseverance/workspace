import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_14: ExerciseSource = {
  id: '1-14',
  chapter: 1,
  number: 14,
  title: 'Histogram of character frequencies',
  summary:
    'Print a horizontal histogram of how often each character appears in the input. K&R exercise 1-14, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The example.
    {
      id: 'a32135ff',
      stdin: 'abba\n',
      expectedStdout: ' 10 |*\n 97 |**\n 98 |**\n',
    },
    // Empty input: no lines.
    { id: 'b76b2977', expectedStdout: '' },
    // No final newline.
    { id: 'df5435a9', stdin: 'abba', expectedStdout: ' 97 |**\n 98 |**\n' },
    // One character.
    { id: 'bc6079b0', stdin: 'x', expectedStdout: '120 |*\n' },
    // Blanks, tabs and newlines are characters too.
    {
      id: '56512edb',
      stdin: ' \t \n',
      expectedStdout: '  9 |*\n 10 |*\n 32 |**\n',
    },
    // Lines come in order of character code, not input order.
    {
      id: '1e6ffd58',
      stdin: 'zA1\n',
      expectedStdout: ' 10 |*\n 49 |*\n 65 |*\n122 |*\n',
    },
    // The lowest and highest codes, 0 and 127.
    { id: '91ac1a9e', stdin: '\x00\x7f', expectedStdout: '  0 |*\n127 |*\n' },
    // Digits and punctuation.
    {
      id: '19179077',
      stdin: '1+1=2\n',
      expectedStdout: ' 10 |*\n 43 |*\n 49 |**\n 50 |*\n 61 |*\n',
    },
    // 3,000 characters.
    {
      id: '407b9038',
      stdin: 'ab\n'.repeat(1000),
      expectedStdout:
        ' 10 |' +
        '*'.repeat(1000) +
        '\n' +
        ' 97 |' +
        '*'.repeat(1000) +
        '\n' +
        ' 98 |' +
        '*'.repeat(1000) +
        '\n',
    },
    // Every ASCII character once.
    {
      id: '781dfec8',
      stdin: Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)).join(
        '',
      ),
      expectedStdout: Array.from(
        { length: 128 },
        (_, i) => String(i).padStart(3) + ' |*\n',
      ).join(''),
    },
  ],
};
