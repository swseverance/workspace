import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Word number i (a letter-only name) appears i times, for i from 1 to 40,
// all mixed together.
const name = (i: number) =>
  'w' +
  String.fromCharCode(97 + Math.floor(i / 26)) +
  String.fromCharCode(97 + (i % 26));
const MANY = Array.from({ length: 40 }, (_, i) => i + 1);
const MIXED = Array.from({ length: 40 }, (_, round) =>
  MANY.filter((i) => i > round).map(name),
).flat();

export const exercise6_4: ExerciseSource = {
  id: '6-4',
  chapter: 6,
  number: 4,
  title: 'Words by frequency',
  summary:
    'Print the distinct words in the input, most frequent first, each preceded by its count. K&R exercise 6-4, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '71fb51e9', expectedStdout: '' },
    // The most frequent word first.
    { id: 'ba818d71', stdin: 'b a b\n', expectedStdout: '2 b\n1 a\n' },
    // Equal counts in alphabetical order.
    { id: '6686f4a9', stdin: 'c b a\n', expectedStdout: '1 a\n1 b\n1 c\n' },
    // Ties within ties.
    { id: '22f6ec62', stdin: 'b b a a c\n', expectedStdout: '2 a\n2 b\n1 c\n' },
    // Upper and lower case are the same word.
    {
      id: 'e181cc5a',
      stdin: 'The the THE cat\n',
      expectedStdout: '3 the\n1 cat\n',
    },
    // Words across lines.
    {
      id: 'd5b118a8',
      stdin: 'x y\ny\nz y x\n',
      expectedStdout: '3 y\n2 x\n1 z\n',
    },
    // Punctuation and digits separate words.
    {
      id: '15df805e',
      stdin: "don't stop, 2stop\n",
      expectedStdout: '2 stop\n1 don\n1 t\n',
    },
    // No words at all.
    { id: '8c32168c', stdin: '... 123 !!!\n', expectedStdout: '' },
    // A last line with no newline.
    { id: 'f9095aa1', stdin: 'a a', expectedStdout: '2 a\n' },
    // 40 words with 40 different counts, mixed together.
    {
      id: '05770531',
      stdin: MIXED.join(' ') + '\n',
      expectedStdout: [...MANY]
        .reverse()
        .map((i) => `${i} ${name(i)}\n`)
        .join(''),
    },
    // One word 20,000 times.
    {
      id: '4596c462',
      stdin: 'echo '.repeat(20000) + '\n',
      expectedStdout: '20000 echo\n',
    },
  ],
};
