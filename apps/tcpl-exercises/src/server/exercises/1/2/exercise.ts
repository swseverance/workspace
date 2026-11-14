import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_2: ExerciseSource = {
  id: '1-2',
  chapter: 1,
  number: 2,
  title: 'Escape sequences',
  summary:
    'See what printf does with an unknown escape sequence, then print a line using \\t, \\b, \\" and \\\\. K&R exercise 1-2, solved and tested in your browser.',
  description,
  solution,
  tests: [{ id: '6f8d8062', expectedStdout: '\t \b " \\ \n' }],
};
