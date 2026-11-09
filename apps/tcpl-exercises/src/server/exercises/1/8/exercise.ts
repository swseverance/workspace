import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_8: ExerciseSource = {
  id: '1-8',
  chapter: 1,
  number: 8,
  description,
  solution,
  tests: [
    {
      id: 'e723a745',
      stdin: 'abc',
      expectedStdout: '0 0 0\n',
    },
    {
      id: '78fff04a',
      stdin: 'a b\tc\n',
      expectedStdout: '1 1 1\n',
    },
    {
      id: '0184682f',
      stdin: '\n\n\n',
      expectedStdout: '0 0 3\n',
    },
    {
      id: '830d0bba',
      stdin: '',
      expectedStdout: '0 0 0\n',
    },
    {
      id: '3beb6c7b',
      stdin: '   ',
      expectedStdout: '3 0 0\n',
    },
    {
      id: '25195b07',
      stdin: '\t\t',
      expectedStdout: '0 2 0\n',
    },
    {
      id: '240b35cb',
      stdin: '  a\t\tb\n\nc  \n',
      expectedStdout: '4 2 3\n',
    },
  ],
};
