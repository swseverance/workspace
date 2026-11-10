import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise33_2: ExerciseSource = {
  id: '33-2',
  chapter: 33,
  number: 2,
  title: 'Fahrenheit-Celsius table',
  summary:
    'Practice exercise: print a formatted Fahrenheit-to-Celsius table for a range of temperatures.',
  description,
  solution,
  tests: [
    {
      id: '74e79b6d',
      stdin: '0 300 20',
      expectedStdout:
        'Fahr  Celsius\n' +
        '----  -------\n' +
        '   0    -17.8\n' +
        '  20     -6.7\n' +
        '  40      4.4\n' +
        '  60     15.6\n' +
        '  80     26.7\n' +
        ' 100     37.8\n' +
        ' 120     48.9\n' +
        ' 140     60.0\n' +
        ' 160     71.1\n' +
        ' 180     82.2\n' +
        ' 200     93.3\n' +
        ' 220    104.4\n' +
        ' 240    115.6\n' +
        ' 260    126.7\n' +
        ' 280    137.8\n' +
        ' 300    148.9\n' +
        '----  -------\n' +
        '16 rows\n',
    },
    {
      id: 'd480e62b',
      stdin: '-40 100 10',
      expectedStdout:
        'Fahr  Celsius\n' +
        '----  -------\n' +
        ' -40    -40.0\n' +
        ' -30    -34.4\n' +
        ' -20    -28.9\n' +
        ' -10    -23.3\n' +
        '   0    -17.8\n' +
        '  10    -12.2\n' +
        '  20     -6.7\n' +
        '  30     -1.1\n' +
        '  40      4.4\n' +
        '  50     10.0\n' +
        '  60     15.6\n' +
        '  70     21.1\n' +
        '  80     26.7\n' +
        '  90     32.2\n' +
        ' 100     37.8\n' +
        '----  -------\n' +
        '15 rows\n',
    },
    {
      id: 'c0132a28',
      stdin: '212 212 1',
      expectedStdout:
        'Fahr  Celsius\n' +
        '----  -------\n' +
        ' 212    100.0\n' +
        '----  -------\n' +
        '1 row\n',
    },
  ],
};
