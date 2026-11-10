import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise33_3: ExerciseSource = {
  id: '33-3',
  chapter: 33,
  number: 3,
  title: 'Print a greeting',
  summary: 'Practice exercise: print a fixed greeting.',
  description,
  solution,
  tests: [{ id: '56472e15', expectedStdout: 'Hello, dummy!\n' }],
};
