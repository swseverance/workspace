import { ExerciseSource } from '../../../../models/exercise';
import sort from '../sort.md' with { type: 'text' };
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// item000 to item999 in mixed case, shuffled: 37 shares no factor with
// 1000. Every line is different even with case folded, so the sorted
// order is certain.
const word = (n: number) =>
  `${n % 2 ? 'ITEM' : n % 3 ? 'Item' : 'item'}${String(n).padStart(3, '0')}`;
const SHUFFLED = Array.from({ length: 1000 }, (_, k) => (k * 37) % 1000);

export const exercise5_15: ExerciseSource = {
  id: '5-15',
  chapter: 5,
  number: 15,
  title: 'sort -f',
  summary:
    'Add a -f option to the sort program to fold upper and lower case together, so a and A compare equal. K&R exercise 5-15, solved and tested in your browser.',
  description: `${description}\n${sort}`,
  solution,
  tests: [
    // Empty input.
    { id: '56213062', args: ['-f'], expectedStdout: '' },
    // Without -f, upper case comes before lower case.
    {
      id: '98d07aa9',
      stdin: 'banana\nApple\ncherry\nBanana2\n',
      expectedStdout: 'Apple\nBanana2\nbanana\ncherry\n',
    },
    // -f ignores case.
    {
      id: '935e3c49',
      args: ['-f'],
      stdin: 'banana\nApple\nCherry\n',
      expectedStdout: 'Apple\nbanana\nCherry\n',
    },
    // Case mixed inside words.
    {
      id: '100fcedf',
      args: ['-f'],
      stdin: 'Help\nhELLO\nhello world\n',
      expectedStdout: 'hELLO\nhello world\nHelp\n',
    },
    // A line still comes after its prefixes.
    {
      id: '140546a7',
      args: ['-f'],
      stdin: 'AbCd\nABC\nab\n',
      expectedStdout: 'ab\nABC\nAbCd\n',
    },
    // Digits and blanks compare as before.
    {
      id: 'e1662624',
      args: ['-f'],
      stdin: 'b2\nB1\na 3\n',
      expectedStdout: 'a 3\nB1\nb2\n',
    },
    // -f and -r as separate options.
    {
      id: '74ab8d6b',
      args: ['-f', '-r'],
      stdin: 'banana\nApple\nCherry\n',
      expectedStdout: 'Cherry\nbanana\nApple\n',
    },
    // -rf together.
    {
      id: '71ea0073',
      args: ['-rf'],
      stdin: 'dog\nCat\nbird\n',
      expectedStdout: 'dog\nCat\nbird\n',
    },
    // -n still works.
    {
      id: '7743a55d',
      args: ['-n'],
      stdin: '10\n9\n',
      expectedStdout: '9\n10\n',
    },
    // A last line with no newline.
    { id: '39bf7dde', args: ['-f'], stdin: 'b\nA', expectedStdout: 'A\nb\n' },
    // 1000 words in mixed case.
    {
      id: '9bb69f6b',
      args: ['-f'],
      stdin: SHUFFLED.map((n) => `${word(n)}\n`).join(''),
      expectedStdout: Array.from(
        { length: 1000 },
        (_, n) => `${word(n)}\n`,
      ).join(''),
    },
  ],
};
