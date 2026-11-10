import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_4: ExerciseSource = {
  id: '1-4',
  chapter: 1,
  number: 4,
  title: 'Celsius to Fahrenheit table',
  summary:
    'Print a Celsius-to-Fahrenheit conversion table from 0 to 300 degrees. K&R exercise 1-4, solved and tested in your browser.',
  description,
  solution,
  tests: [
    {
      id: '4df82e10',
      expectedStdout:
        '  0   32.0\n' +
        ' 20   68.0\n' +
        ' 40  104.0\n' +
        ' 60  140.0\n' +
        ' 80  176.0\n' +
        '100  212.0\n' +
        '120  248.0\n' +
        '140  284.0\n' +
        '160  320.0\n' +
        '180  356.0\n' +
        '200  392.0\n' +
        '220  428.0\n' +
        '240  464.0\n' +
        '260  500.0\n' +
        '280  536.0\n' +
        '300  572.0\n',
    },
  ],
};
