import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// 800 different three-letter words from "aaa" on, in alphabetical order,
// avoiding noise words.
const NOISE = new Set(['and', 'the']);
const WORDS = Array.from({ length: 900 }, (_, i) =>
  [26 * 26, 26, 1]
    .map((place) => String.fromCharCode(97 + (Math.floor(i / place) % 26)))
    .join(''),
)
  .filter((word) => !NOISE.has(word))
  .slice(0, 800);

export const exercise6_3: ExerciseSource = {
  id: '6-3',
  chapter: 6,
  number: 3,
  title: 'A cross-referencer',
  summary:
    'Print each word in a document with the numbers of the lines it is on, leaving out noise words. K&R exercise 6-3, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '7110f74d', expectedStdout: '' },
    // One line.
    {
      id: '8ed9c7af',
      stdin: 'hello world\n',
      expectedStdout: 'hello 1\nworld 1\n',
    },
    // Several lines.
    {
      id: '7d1b7c9c',
      stdin: 'apple banana\nbanana cherry\napple\n',
      expectedStdout: 'apple 1 3\nbanana 1 2\ncherry 2\n',
    },
    // A word twice on one line is listed once.
    {
      id: '2318f88b',
      stdin: 'go go go\nstop go\n',
      expectedStdout: 'go 1 2\nstop 2\n',
    },
    // Upper and lower case are the same word.
    {
      id: '08dcc211',
      stdin: 'Apple apple\nAPPLE\n',
      expectedStdout: 'apple 1 2\n',
    },
    // Noise words are left out, in any case.
    {
      id: 'ecfa5002',
      stdin: 'The cat and the hat\nA an IN of Or to Is it\n',
      expectedStdout: 'cat 1\nhat 1\n',
    },
    // Words that start like noise words aren't noise.
    {
      id: 'e0f9dd56',
      stdin: 'then andes there\n',
      expectedStdout: 'andes 1\nthen 1\nthere 1\n',
    },
    // Punctuation and digits separate words.
    {
      id: '4bafc6c2',
      stdin: 'end-of-line, 42nd!\n',
      expectedStdout: 'end 1\nline 1\nnd 1\n',
    },
    // Blank lines still count.
    { id: 'e65759b7', stdin: 'x\n\n\ny\n', expectedStdout: 'x 1\ny 4\n' },
    // A word comes after its prefixes.
    {
      id: 'ec8ef92b',
      stdin: 'card car cart\n',
      expectedStdout: 'car 1\ncard 1\ncart 1\n',
    },
    // A last line with no newline.
    { id: 'eca65fb1', stdin: 'a b\nc d', expectedStdout: 'b 1\nc 2\nd 2\n' },
    // One word on 1000 lines.
    {
      id: '1e49a394',
      stdin: 'word\n'.repeat(1000),
      expectedStdout:
        'word ' +
        Array.from({ length: 1000 }, (_, i) => i + 1).join(' ') +
        '\n',
    },
    // 800 words, one per line, in reverse order.
    {
      id: '3315fa7d',
      stdin: [...WORDS]
        .reverse()
        .map((word) => `${word}\n`)
        .join(''),
      expectedStdout: WORDS.map((word, i) => `${word} ${800 - i}\n`).join(''),
    },
  ],
};
