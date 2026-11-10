import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_3: ExerciseSource = {
  id: '1-3',
  chapter: 1,
  number: 3,
  title: 'Temperature table with a heading',
  summary:
    'Print a Fahrenheit-to-Celsius conversion table with a heading above it. K&R exercise 1-3, solved and tested in your browser.',
  description,
  solution,
  tests: [
    {
      id: '83341860',
      expectedStdout:
        'Fahr Celsius\n' +
        '  0  -17.8\n' +
        ' 20   -6.7\n' +
        ' 40    4.4\n' +
        ' 60   15.6\n' +
        ' 80   26.7\n' +
        '100   37.8\n' +
        '120   48.9\n' +
        '140   60.0\n' +
        '160   71.1\n' +
        '180   82.2\n' +
        '200   93.3\n' +
        '220  104.4\n' +
        '240  115.6\n' +
        '260  126.7\n' +
        '280  137.8\n' +
        '300  148.9\n',
    },
  ],
};
