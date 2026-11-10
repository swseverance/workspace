import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_7: ExerciseSource = {
  id: '1-7',
  chapter: 1,
  number: 7,
  title: 'Print the value of EOF',
  summary:
    'Print the value of the EOF constant from stdio.h. K&R exercise 1-7, solved and tested in your browser.',
  description,
  solution,
  // EOF is -1 in glibc, the C library the programs run with.
  tests: [{ id: 'f5377075', expectedStdout: '-1\n' }],
};
