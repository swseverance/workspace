import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

/** Every string of a's and b's up to max characters long, shortest first. */
function strings(max: number): string[] {
  const all = [''];
  let last = [''];
  for (let length = 1; length <= max; length++) {
    last = last.flatMap((s) => [s + 'a', s + 'b']);
    all.push(...last);
  }
  return all;
}

// Every s of up to 5 a's and b's against every t of up to 3: 945 pairs,
// covering each way t can sit in s, overlap itself or nearly match.
const PAIRS = strings(5).flatMap((s) => strings(3).map((t) => ({ s, t })));

export const exercise4_1: ExerciseSource = {
  id: '4-1',
  chapter: 4,
  number: 1,
  title: 'Rightmost occurrence of a string',
  summary:
    'Find the position of the rightmost occurrence of one string in another, or -1 if there is none. K&R exercise 4-1, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'ae767877', expectedStdout: '' },
    // One occurrence.
    { id: 'acf9a367', stdin: 'hello world\nworld\n', expectedStdout: '6\n' },
    // Several occurrences: the last one counts.
    { id: '41fb1970', stdin: 'abcabcabc\nabc\n', expectedStdout: '6\n' },
    // A single character, last in s.
    { id: 'bad0463c', stdin: 'banana\na\n', expectedStdout: '5\n' },
    // Only at the start.
    { id: '363f1119', stdin: 'abcdef\nabc\n', expectedStdout: '0\n' },
    // Not there at all.
    { id: 'f0a39030', stdin: 'hello\nxyz\n', expectedStdout: '-1\n' },
    // Part of t at the end of s doesn't count.
    { id: '24e7afe9', stdin: 'abcab\nabc\n', expectedStdout: '0\n' },
    // t longer than s, and t equal to s.
    {
      id: 'b84e9e63',
      stdin: 'ab\nabc\nsame\nsame\n',
      expectedStdout: '-1\n0\n',
    },
    // Overlapping occurrences.
    { id: '9a1656ef', stdin: 'aaaa\naa\n', expectedStdout: '2\n' },
    // The last occurrence starts inside the one before it.
    { id: '66a9fba3', stdin: 'aaa\naa\n', expectedStdout: '1\n' },
    // An occurrence that starts inside a failed partial match.
    { id: '16266497', stdin: 'aaab\naab\n', expectedStdout: '1\n' },
    // Every short s and t made of a's and b's.
    {
      id: 'a605a671',
      stdin: PAIRS.map(({ s, t }) => `${s}\n${t}\n`).join(''),
      expectedStdout: PAIRS.map(
        ({ s, t }) => `${t === '' ? -1 : s.lastIndexOf(t)}\n`,
      ).join(''),
    },
    // Upper and lower case differ.
    { id: '228c5e9c', stdin: 'Hello hello\nH\n', expectedStdout: '0\n' },
    // An empty s, then an empty t.
    { id: 'dd0176ae', stdin: '\nabc\nabc\n\n', expectedStdout: '-1\n-1\n' },
    // Both s and t empty.
    { id: 'e47d0b91', stdin: '\n\n', expectedStdout: '-1\n' },
    // An empty s on its own.
    { id: 'a04ee72e', stdin: '\nabc\n', expectedStdout: '-1\n' },
    // A last line with no newline.
    { id: '60d6ccb9', stdin: 'find me\nme', expectedStdout: '5\n' },
    // 1000-character lines with many near misses.
    {
      id: '5cc5d0ed',
      stdin:
        'a'.repeat(1000) +
        '\n' +
        'a'.repeat(100) +
        '\n' +
        'a'.repeat(1000) +
        '\n' +
        'a'.repeat(99) +
        'b\n',
      expectedStdout: '900\n-1\n',
    },
  ],
};
