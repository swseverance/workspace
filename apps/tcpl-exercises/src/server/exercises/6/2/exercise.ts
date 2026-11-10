import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// var000 to var999, shuffled (37 shares no factor with 1000), grouped by
// their first 5 characters: var00 to var99, ten names each.
const pad = (n: number) => String(n).padStart(3, '0');
const SHUFFLED = Array.from({ length: 1000 }, (_, k) => (k * 37) % 1000);
const GROUPS = Array.from({ length: 100 }, (_, g) =>
  Array.from({ length: 10 }, (_, i) => `var${pad(10 * g + i)}`).join(' '),
);

export const exercise6_2: ExerciseSource = {
  id: '6-2',
  chapter: 6,
  number: 2,
  title: 'Names alike in their first 6 characters',
  summary:
    'Print groups of names in a C program that match in their first 6 characters but differ after. K&R exercise 6-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '27834bc8', expectedStdout: '' },
    // A group of two; a shorter name is left out.
    {
      id: '6668c450',
      stdin: 'int counter1, counter2, count;\n',
      expectedStdout: 'counter1 counter2\n',
    },
    // No names alike.
    { id: '57140c29', stdin: 'int alpha, beta;\n', expectedStdout: '' },
    // A name used more than once counts once.
    {
      id: '1c026673',
      stdin: 'x = values1 + values1 + values2;\n',
      expectedStdout: 'values1 values2\n',
    },
    // A name exactly 6 characters long.
    {
      id: '5176e426',
      stdin: 'abcdefg + abcdef;\n',
      expectedStdout: 'abcdef abcdefg\n',
    },
    // Several groups, in alphabetical order.
    {
      id: '0e26af8c',
      stdin: 'zzzzzz1 aaaaaa2 zzzzzz2 aaaaaa1 mmmmmm;\n',
      expectedStdout: 'aaaaaa1 aaaaaa2\nzzzzzz1 zzzzzz2\n',
    },
    // Keywords aren't names.
    { id: '8fefba84', stdin: 'unsigned unsigned1;\n', expectedStdout: '' },
    // Names in strings and comments are skipped.
    {
      id: '404222e5',
      stdin: 'printf("counter1"); /* counter2 */ counter3 = counter4++;\n',
      expectedStdout: 'counter3 counter4\n',
    },
    // So are preprocessor lines and character constants; case counts.
    {
      id: '05eb231d',
      stdin:
        "#define BUFFER1 10\nchar c = 'buffer9'; int buffer2, buffer3, BUFFER4;\n",
      expectedStdout: 'buffer2 buffer3\n',
    },
    // Underscores and digits are part of names.
    {
      id: '3442cec7',
      stdin: 'my_var1 = my_var2;\n',
      expectedStdout: 'my_var1 my_var2\n',
    },
    // The letters in numbers aren't names.
    {
      id: '93db6523',
      stdin: 'x = 0xffffff1 + 0xffffff2;\n',
      expectedStdout: '',
    },
    // -3 compares 3 characters.
    {
      id: '15d057c3',
      args: ['-3'],
      stdin: 'abc1 = abc2 + ab + abd;\n',
      expectedStdout: 'abc1 abc2\n',
    },
    // A last line with no newline.
    {
      id: '981b6b4f',
      stdin: 'longname1 = longname2',
      expectedStdout: 'longname1 longname2\n',
    },
    // 1000 names in 100 groups.
    {
      id: 'ef97239e',
      args: ['-5'],
      stdin: SHUFFLED.map((n) => `var${pad(n)} = 0;\n`).join(''),
      expectedStdout: GROUPS.map((group) => `${group}\n`).join(''),
    },
  ],
};
