import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

// Define n0 to n999, undefine every third, then look them all up. With
// 101 hash buckets the chains are about ten long, so names are removed
// from the start, middle and end of chains.
const NUMBERS = Array.from({ length: 1000 }, (_, i) => i);
const MANY_IN =
  NUMBERS.map((i) => `define n${i} text ${i}\n`).join('') +
  NUMBERS.filter((i) => i % 3 === 0)
    .map((i) => `undef n${i}\n`)
    .join('') +
  NUMBERS.map((i) => `lookup n${i}\n`).join('');
const MANY_OUT = NUMBERS.map((i) =>
  i % 3 === 0 ? 'undefined\n' : `text ${i}\n`,
).join('');

export const exercise6_5: ExerciseSource = {
  id: '6-5',
  chapter: 6,
  number: 5,
  title: 'Remove a name from the table',
  summary:
    'Write undef, which removes a name and its definition from the hash table kept by lookup and install. K&R exercise 6-5, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '77ed3040', expectedStdout: '' },
    // Define, then look up.
    { id: '7c04efb0', stdin: 'define x 1\nlookup x\n', expectedStdout: '1\n' },
    // A name that was never defined.
    { id: 'aa4a5fd7', stdin: 'lookup y\n', expectedStdout: 'undefined\n' },
    // undef removes a name.
    {
      id: '38fa6486',
      stdin: 'define x 1\nundef x\nlookup x\n',
      expectedStdout: 'undefined\n',
    },
    // undef leaves other names alone.
    {
      id: 'd6ac6b00',
      stdin:
        'define a 1\ndefine b 2\ndefine c 3\nundef b\nlookup a\nlookup b\nlookup c\n',
      expectedStdout: '1\nundefined\n3\n',
    },
    // A name can be defined again after undef.
    {
      id: 'd2d1fd5f',
      stdin: 'define x 1\nundef x\ndefine x 3\nlookup x\n',
      expectedStdout: '3\n',
    },
    // A second define replaces the first; one undef removes it.
    {
      id: 'd3c6f7bc',
      stdin: 'define x 1\ndefine x 2\nlookup x\nundef x\nlookup x\n',
      expectedStdout: '2\nundefined\n',
    },
    // undef of a name that isn't there does nothing.
    {
      id: '71786f6c',
      stdin: 'define x 1\nundef nothing\nundef x\nundef x\nlookup x\n',
      expectedStdout: 'undefined\n',
    },
    // Text with blanks in it.
    {
      id: 'daeff98d',
      stdin: 'define msg hello, world\nlookup msg\n',
      expectedStdout: 'hello, world\n',
    },
    // A last line with no newline.
    { id: '8fed1ff4', stdin: 'define x 5\nlookup x', expectedStdout: '5\n' },
    // 1000 names, a third of them removed.
    { id: '55bbaeaf', stdin: MANY_IN, expectedStdout: MANY_OUT },
  ],
};
