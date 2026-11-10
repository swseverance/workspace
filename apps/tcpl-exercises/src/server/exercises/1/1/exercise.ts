import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_1: ExerciseSource = {
  id: '1-1',
  chapter: 1,
  number: 1,
  title: 'Hello, world',
  summary:
    'Write the classic "hello, world" program, then break it on purpose to see what the compiler says. K&R exercise 1-1, solved and tested in your browser.',
  description,
  solution,
  tests: [{ id: '3ee816ef', expectedStdout: 'hello, world\n' }],
};
