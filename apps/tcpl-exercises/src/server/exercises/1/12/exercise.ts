import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise1_12: ExerciseSource = {
  id: '1-12',
  chapter: 1,
  number: 12,
  title: 'One word per line',
  summary:
    'Print the input one word per line, skipping blanks, tabs and empty lines. K&R exercise 1-12, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '6a85d930', expectedStdout: '' },
    // One word.
    { id: '6d28b0ab', stdin: 'hello\n', expectedStdout: 'hello\n' },
    // Two words.
    {
      id: '59ca20ff',
      stdin: 'hello world\n',
      expectedStdout: 'hello\nworld\n',
    },
    // No final newline: the last word still ends its line.
    { id: 'f9d4373c', stdin: 'hello world', expectedStdout: 'hello\nworld\n' },
    // Several blanks between words.
    { id: '9932c251', stdin: 'a   b\n', expectedStdout: 'a\nb\n' },
    // Tabs separate words too.
    { id: '37b2b928', stdin: 'a\tb\t\tc\n', expectedStdout: 'a\nb\nc\n' },
    // Leading and trailing blanks.
    { id: '70e306e1', stdin: '  a b  \n', expectedStdout: 'a\nb\n' },
    // Blank lines don't become empty lines.
    { id: 'f0d61107', stdin: '\n\nx\n\n', expectedStdout: 'x\n' },
    // Only blanks and tabs: no words.
    { id: 'ee59e150', stdin: ' \t \n', expectedStdout: '' },
    // Words on several lines.
    {
      id: '216bad10',
      stdin: 'one two\nthree\n',
      expectedStdout: 'one\ntwo\nthree\n',
    },
    // Punctuation is part of a word.
    {
      id: '2f339b04',
      stdin: "don't stop--now!\n",
      expectedStdout: "don't\nstop--now!\n",
    },
    // A carriage return doesn't separate words.
    { id: '5d794e4f', stdin: 'a\rb c\n', expectedStdout: 'a\rb\nc\n' },
    // One 5,000-character word.
    {
      id: 'c21cdc3a',
      stdin: 'x'.repeat(5000) + '\n',
      expectedStdout: 'x'.repeat(5000) + '\n',
    },
    // 1,500 words.
    {
      id: 'f4f72989',
      stdin: 'ab \t'.repeat(1500) + '\n',
      expectedStdout: 'ab\n'.repeat(1500),
    },
  ],
};
