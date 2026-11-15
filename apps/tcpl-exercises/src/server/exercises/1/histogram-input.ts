// Inputs shared by the tests of exercises 1-13a and 1-13b.

// How many words there are of each length from 1 to 12. The last three all
// land in the bar for 10, and no two neighbouring bars are the same height.
const COUNTS = [3, 1, 4, 1, 5, 9, 2, 6, 5, 1, 1, 1];

const SEPARATORS = [' ', '\n', '\t', '  ', '\n\n'];

/**
 * 39 words of every length from 1 to 12, the lengths mixed together and the
 * words separated by a varying run of blanks, tabs and newlines. The bars
 * for 1 to 10 are 3, 1, 4, 1, 5, 9, 2, 6, 5 and 3 high.
 */
export const EVERY_LENGTH = Array.from({ length: Math.max(...COUNTS) })
  .flatMap((_, round) =>
    COUNTS.flatMap((count, i) => (count > round ? ['x'.repeat(i + 1)] : [])),
  )
  .map((word, i) => word + SEPARATORS[i % SEPARATORS.length])
  .join('');

/**
 * One 5,000-character word and one 2-character word. The input starts with
 * blank lines and ends with blanks and a tab rather than a newline, none of
 * which is a word.
 */
export const LONG_WORD = '\n\n\t  ' + 'x'.repeat(5000) + ' \t ab  \t';
