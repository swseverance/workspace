import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// The last row of every vertical histogram.
const LABELS = '  1  2  3  4  5  6  7  8  9 10\n';

// Lines 4 to 10 of a horizontal histogram with no words of those lengths.
const EMPTY_4_TO_10 = ' 4 |\n 5 |\n 6 |\n 7 |\n 8 |\n 9 |\n10 |\n';

export const exercise1_13: ExerciseSource = {
  id: '1-13',
  chapter: 1,
  number: 13,
  title: 'Histogram of word lengths',
  summary:
    'Print a histogram of the lengths of words in the input, with horizontal or vertical bars. K&R exercise 1-13, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The example, horizontal.
    {
      id: '283e60de',
      stdin: '0\nI am the one\n',
      expectedStdout: ' 1 |*\n 2 |*\n 3 |**\n' + EMPTY_4_TO_10,
    },
    // The example, vertical.
    {
      id: '5afff648',
      stdin: '1\nI am the one\n',
      expectedStdout: '        *\n  *  *  *\n' + LABELS,
    },
    // No words, horizontal: every bar is empty.
    {
      id: 'c501ef7b',
      stdin: '0',
      expectedStdout: ' 1 |\n 2 |\n 3 |\n' + EMPTY_4_TO_10,
    },
    // No words, vertical: just the labels.
    { id: '54ab5bb6', stdin: '1', expectedStdout: LABELS },
    // No final newline: the last word still counts.
    {
      id: '7bd8afdb',
      stdin: '0\nhello wor',
      expectedStdout:
        ' 1 |\n 2 |\n 3 |*\n 4 |\n 5 |*\n 6 |\n 7 |\n 8 |\n 9 |\n10 |\n',
    },
    // Blanks, tabs and blank lines between words.
    {
      id: '51912ce7',
      stdin: '1\n  a\t\tbb\n\n ccc  \n',
      expectedStdout: '  *  *  *\n' + LABELS,
    },
    // Words of 10 or more characters share the last bar, horizontal.
    {
      id: '8b19039a',
      stdin: '0\nabcdefghij abcdefghijklmnop x\n',
      expectedStdout:
        ' 1 |*\n 2 |\n 3 |\n 4 |\n 5 |\n 6 |\n 7 |\n 8 |\n 9 |\n10 |**\n',
    },
    // Words of 10 or more characters share the last bar, vertical.
    {
      id: '67cfa38d',
      stdin: '1\nabcdefghijklmnop abcdefghij\n',
      expectedStdout: ' '.repeat(29) + '*\n' + ' '.repeat(29) + '*\n' + LABELS,
    },
    // Rows stop at their last *, with no trailing spaces.
    {
      id: 'd9fdc1ae',
      stdin: '1\na b c fives\n',
      expectedStdout: '  *\n  *\n  *           *\n' + LABELS,
    },
    // Punctuation is part of a word.
    {
      id: 'cf3d3a69',
      stdin: "0\ndon't stop--now!\n",
      expectedStdout:
        ' 1 |\n 2 |\n 3 |\n 4 |\n 5 |*\n 6 |\n 7 |\n 8 |\n 9 |\n10 |*\n',
    },
    // A word can start right after the 0 or 1.
    { id: '019c2036', stdin: '1ab', expectedStdout: '     *\n' + LABELS },
    // 900 words, horizontal.
    {
      id: '330c840b',
      stdin: '0\n' + 'a bb ccc '.repeat(300) + '\n',
      expectedStdout:
        ' 1 |' +
        '*'.repeat(300) +
        '\n' +
        ' 2 |' +
        '*'.repeat(300) +
        '\n' +
        ' 3 |' +
        '*'.repeat(300) +
        '\n' +
        EMPTY_4_TO_10,
    },
    // A 50-row vertical histogram.
    {
      id: '7c829527',
      stdin: '1\n' + 'a '.repeat(50) + 'bb '.repeat(20) + '\n',
      expectedStdout: '  *\n'.repeat(30) + '  *  *\n'.repeat(20) + LABELS,
    },
  ],
};
