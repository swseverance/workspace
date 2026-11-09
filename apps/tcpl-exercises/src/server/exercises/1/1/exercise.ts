import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_1: ExerciseSource = {
  id: '1-1',
  chapter: 1,
  number: 1,
  description,
  solution,
  tests: [{ id: '3ee816ef', expectedStdout: 'hello, world\n' }],
};
