import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

export const exercise3_3: ExerciseSource = {
  id: '3-3',
  chapter: 3,
  number: 3,
  title: 'Expand shorthand like a-z',
  summary:
    'Expand shorthand like a-z and 0-9 in a string into the full list of characters. K&R exercise 3-3, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '415e1a14', expectedStdout: '' },
    // The whole lower case alphabet.
    { id: '4316269b', stdin: 'a-z\n', expectedStdout: `${LOWER}\n` },
    // Upper case and digits.
    {
      id: '43baf6ab',
      stdin: 'A-Z\n0-9\n',
      expectedStdout: `${UPPER}\n${DIGITS}\n`,
    },
    // A short range with text around it.
    { id: '4724a575', stdin: 'x a-e y\n', expectedStdout: 'x abcde y\n' },
    // Chained ranges share their middle letter.
    {
      id: '493d9656',
      stdin: 'a-b-c\na-c-e\n0-3-5\n',
      expectedStdout: 'abc\nabcde\n012345\n',
    },
    // Ranges one after another.
    {
      id: '4be602a5',
      stdin: 'a-z0-9\n',
      expectedStdout: `${LOWER}${DIGITS}\n`,
    },
    // A leading or trailing - is literal.
    {
      id: '4f3986bb',
      stdin: '-a-z\na-z-\n-\na-\n-z\n',
      expectedStdout: `-${LOWER}\n${LOWER}-\n-\na-\n-z\n`,
    },
    // Ends from different ranges.
    {
      id: '550da7ac',
      stdin: 'a-Z\nA-z\na-9\n9-a\n',
      expectedStdout: 'a-Z\nA-z\na-9\n9-a\n',
    },
    // Ranges written backwards.
    { id: '6324f4e1', stdin: 'z-a\n9-0\n', expectedStdout: 'z-a\n9-0\n' },
    // A range of one character.
    { id: '63839dcd', stdin: 'a-a\n5-5\n', expectedStdout: 'a\n5\n' },
    // Hyphens with nothing to expand.
    {
      id: '6729df24',
      stdin: 'a--z\na - z\n!-~\n',
      expectedStdout: 'a--z\na - z\n!-~\n',
    },
    // A blank line.
    { id: '68142ec6', stdin: 'a-c\n\nx-z\n', expectedStdout: 'abc\n\nxyz\n' },
    // A last line with no newline.
    { id: '690371d3', stdin: 'a-c', expectedStdout: 'abc\n' },
    // A 900-character line that expands to 6200 characters.
    {
      id: '6aafe0c7',
      stdin: 'a-z0-9A-Z'.repeat(100) + '\n',
      expectedStdout: (LOWER + DIGITS + UPPER).repeat(100) + '\n',
    },
  ],
};
