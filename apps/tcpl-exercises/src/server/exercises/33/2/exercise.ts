import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise33_2: ExerciseSource = {
  id: '33-2',
  chapter: 33,
  number: 2,
  description,
  solution,
  tests: [
    { id: 'ff73f465', stdin: '1 2', expectedStdout: '3\n' },
    { id: '06ef80a8', stdin: '0 0', expectedStdout: '0\n' },
    { id: 'd9dcff6b', stdin: '-5 5', expectedStdout: '0\n' },
  ],
};
