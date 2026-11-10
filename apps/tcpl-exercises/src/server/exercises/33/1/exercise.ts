import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise33_1: ExerciseSource = {
  id: '33-1',
  chapter: 33,
  number: 1,
  title: 'Double an integer',
  summary:
    'Practice exercise: read an integer from standard input and print double its value.',
  description,
  solution,
  tests: [
    { id: '0fb3ce5e', stdin: '5', expectedStdout: '10\n' },
    { id: '4594e95f', stdin: '0', expectedStdout: '0\n' },
    { id: '516c14ff', stdin: '-3', expectedStdout: '-6\n' },
  ],
};
