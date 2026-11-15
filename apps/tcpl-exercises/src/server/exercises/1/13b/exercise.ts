import { ExerciseSource } from '../../../../models/exercise';
import { EVERY_LENGTH, LONG_WORD } from '../histogram-input';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// The last two lines of every histogram: the axis and the lengths.
const LABELS = '-'.repeat(30) + '\n  1  2  3  4  5  6  7  8  9 10\n';

/**
 * A row of the histogram with a * for each of the given lengths. Every row
 * is 30 characters wide, so most end with spaces.
 */
const row = (...lengths: number[]): string =>
  Array.from({ length: 10 }, (_, i) =>
    lengths.includes(i + 1) ? '  *' : '   ',
  ).join('') + '\n';

export const exercise1_13b: ExerciseSource = {
  id: '1-13b',
  chapter: 1,
  number: 13,
  suffix: 'b',
  title: 'Vertical histogram of word lengths',
  summary:
    'Print a histogram of the lengths of words in the input, with vertical bars. K&R exercise 1-13, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The example.
    {
      id: '5afff648',
      stdin: 'I am the one\n',
      expectedStdout: row(3) + row(1, 2, 3) + LABELS,
    },
    // No words: just the axis and the lengths.
    { id: '54ab5bb6', stdin: '', expectedStdout: LABELS },
    // No final newline: the last word still counts.
    {
      id: 'f1d61f34',
      stdin: 'hello wor',
      expectedStdout: row(3, 5) + LABELS,
    },
    // Blanks, tabs and blank lines between words.
    {
      id: '51912ce7',
      stdin: '  a\t\tbb\n\n ccc  \n',
      expectedStdout: row(1, 2, 3) + LABELS,
    },
    // Words of 10 or more characters share the last bar.
    {
      id: '67cfa38d',
      stdin: 'abcdefghijklmnop abcdefghij\n',
      expectedStdout: row(10) + row(10) + LABELS,
    },
    // A short bar far to the right of a tall one.
    {
      id: 'd9fdc1ae',
      stdin: 'a b c fives\n',
      expectedStdout: row(1) + row(1) + row(1, 5) + LABELS,
    },
    // Punctuation is part of a word.
    {
      id: '753b9552',
      stdin: "don't stop--now!\n",
      expectedStdout: row(5, 10) + LABELS,
    },
    // A 50-row histogram.
    {
      id: '7c829527',
      stdin: 'a '.repeat(50) + 'bb '.repeat(20) + '\n',
      expectedStdout: row(1).repeat(30) + row(1, 2).repeat(20) + LABELS,
    },
    // Words of every length from 1 to 12: each bar is a different height
    // from its neighbours, and 10, 11 and 12 all count as 10.
    {
      id: '2e9f3689',
      stdin: EVERY_LENGTH,
      expectedStdout:
        row(6).repeat(3) +
        row(6, 8) +
        row(5, 6, 8, 9) +
        row(3, 5, 6, 8, 9) +
        row(1, 3, 5, 6, 8, 9, 10) +
        row(1, 3, 5, 6, 7, 8, 9, 10) +
        row(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) +
        LABELS,
    },
    // A 5,000-character word, with only blanks, tabs and newlines before
    // the first word and after the last.
    {
      id: '6d4ea9f4',
      stdin: LONG_WORD,
      expectedStdout: row(2, 10) + LABELS,
    },
  ],
};
