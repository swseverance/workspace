import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise2_1: ExerciseSource = {
  id: '2-1',
  chapter: 2,
  number: 1,
  title: 'Ranges of integer types',
  summary:
    'Print the smallest and largest values of char, short, int, and long, signed and unsigned. K&R exercise 2-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    {
      id: 'c81e429d',
      expectedStdout:
        'signed char -128 127\n' +
        'unsigned char 0 255\n' +
        'signed short -32768 32767\n' +
        'unsigned short 0 65535\n' +
        'signed int -2147483648 2147483647\n' +
        'unsigned int 0 4294967295\n' +
        'signed long -9223372036854775808 9223372036854775807\n' +
        'unsigned long 0 18446744073709551615\n',
    },
  ],
};
