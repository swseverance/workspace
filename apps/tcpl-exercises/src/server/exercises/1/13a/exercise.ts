import { ExerciseSource } from '../../../../models/exercise';
import { EVERY_LENGTH, LONG_WORD } from '../histogram-input';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Lines 4 to 10 of a histogram with no words of those lengths.
const EMPTY_4_TO_10 = ' 4 |\n 5 |\n 6 |\n 7 |\n 8 |\n 9 |\n10 |\n';

export const exercise1_13a: ExerciseSource = {
  id: '1-13a',
  chapter: 1,
  number: 13,
  suffix: 'a',
  title: 'Horizontal histogram of word lengths',
  summary:
    'Print a histogram of the lengths of words in the input, with horizontal bars. K&R exercise 1-13, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // The example.
    {
      id: '283e60de',
      stdin: 'I am the one\n',
      expectedStdout: ' 1 |*\n 2 |*\n 3 |**\n' + EMPTY_4_TO_10,
    },
    // No words: every bar is empty.
    {
      id: 'c501ef7b',
      stdin: '',
      expectedStdout: ' 1 |\n 2 |\n 3 |\n' + EMPTY_4_TO_10,
    },
    // No final newline: the last word still counts.
    {
      id: '7bd8afdb',
      stdin: 'hello wor',
      expectedStdout:
        ' 1 |\n 2 |\n 3 |*\n 4 |\n 5 |*\n 6 |\n 7 |\n 8 |\n 9 |\n10 |\n',
    },
    // Blanks, tabs and blank lines between words.
    {
      id: 'f5df85e5',
      stdin: '  a\t\tbb\n\n ccc  \n',
      expectedStdout: ' 1 |*\n 2 |*\n 3 |*\n' + EMPTY_4_TO_10,
    },
    // Words of 10 or more characters share the last bar.
    {
      id: '8b19039a',
      stdin: 'abcdefghij abcdefghijklmnop x\n',
      expectedStdout:
        ' 1 |*\n 2 |\n 3 |\n 4 |\n 5 |\n 6 |\n 7 |\n 8 |\n 9 |\n10 |**\n',
    },
    // Punctuation is part of a word.
    {
      id: 'cf3d3a69',
      stdin: "don't stop--now!\n",
      expectedStdout:
        ' 1 |\n 2 |\n 3 |\n 4 |\n 5 |*\n 6 |\n 7 |\n 8 |\n 9 |\n10 |*\n',
    },
    // 900 words.
    {
      id: '330c840b',
      stdin: 'a bb ccc '.repeat(300) + '\n',
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
    // Words of every length from 1 to 12: each bar is a different height
    // from its neighbours, and 10, 11 and 12 all count as 10.
    {
      id: '35101778',
      stdin: EVERY_LENGTH,
      expectedStdout:
        ' 1 |***\n' +
        ' 2 |*\n' +
        ' 3 |****\n' +
        ' 4 |*\n' +
        ' 5 |*****\n' +
        ' 6 |*********\n' +
        ' 7 |**\n' +
        ' 8 |******\n' +
        ' 9 |*****\n' +
        '10 |***\n',
    },
    // A 5,000-character word, with only blanks, tabs and newlines before
    // the first word and after the last.
    {
      id: 'fbcb9081',
      stdin: LONG_WORD,
      expectedStdout:
        ' 1 |\n 2 |*\n 3 |\n 4 |\n 5 |\n 6 |\n 7 |\n 8 |\n 9 |\n10 |*\n',
    },
  ],
};
