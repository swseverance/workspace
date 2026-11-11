import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_5: ExerciseSource = {
  id: '1-5',
  chapter: 1,
  number: 5,
  title: 'Temperature table in reverse',
  summary:
    'Print the Fahrenheit-to-Celsius table in reverse order, from 300 degrees down to 0, with a for loop. K&R exercise 1-5, solved and tested in your browser.',
  description,
  solution,
  tests: [
    {
      id: '3f2ed3d8',
      expectedStdout:
        '300  148.9\n' +
        '280  137.8\n' +
        '260  126.7\n' +
        '240  115.6\n' +
        '220  104.4\n' +
        '200   93.3\n' +
        '180   82.2\n' +
        '160   71.1\n' +
        '140   60.0\n' +
        '120   48.9\n' +
        '100   37.8\n' +
        ' 80   26.7\n' +
        ' 60   15.6\n' +
        ' 40    4.4\n' +
        ' 20   -6.7\n' +
        '  0  -17.8\n',
    },
  ],
};
