import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const DAY = 24 * 60 * 60 * 1000;

// Every date in 1988, a leap year, and its day of the year.
const LEAP_DATES = Array.from({ length: 366 }, (_, i) => {
  const date = new Date(Date.UTC(1988, 0, i + 1));
  return {
    input: `1988 ${date.getUTCMonth() + 1} ${date.getUTCDate()}\n`,
    output: `${i + 1}\n`,
  };
});

// Every day of 2023, not a leap year, and its date.
const YEARDAYS = Array.from({ length: 365 }, (_, i) => {
  const date = new Date(Date.UTC(2023, 0, 1) + i * DAY);
  return {
    input: `2023 ${i + 1}\n`,
    output: `${date.getUTCMonth() + 1} ${date.getUTCDate()}\n`,
  };
});

export const exercise5_9: ExerciseSource = {
  id: '5-9',
  chapter: 5,
  number: 9,
  title: 'Date conversion with pointers',
  summary:
    'Rewrite day_of_year and month_day, which convert between dates and days of the year, with pointers. K&R exercise 5-9, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '86a13627', expectedStdout: '' },
    // The book's example: February 29th, 1988 is day 60.
    {
      id: '3c0e5cb9',
      stdin: '1988 2 29\n1988 60\n',
      expectedStdout: '60\n2 29\n',
    },
    // March 1st in a leap year and a non-leap year.
    {
      id: 'fbfea1e9',
      stdin: '1987 3 1\n1988 3 1\n',
      expectedStdout: '60\n61\n',
    },
    // The first and last days of the year.
    {
      id: 'c0908d98',
      stdin: '1987 1 1\n1987 12 31\n1988 12 31\n',
      expectedStdout: '1\n365\n366\n',
    },
    // The first and last days of the year, the other way.
    {
      id: '9df89d17',
      stdin: '1987 1\n1987 365\n1988 366\n',
      expectedStdout: '1 1\n12 31\n12 31\n',
    },
    // Century years: 1900 isn't a leap year; 2000 is.
    {
      id: 'dedb3107',
      stdin: '1900 3 1\n2000 3 1\n1900 60\n2000 60\n',
      expectedStdout: '60\n61\n3 1\n2 29\n',
    },
    // The last day of each month in the middle of the year.
    {
      id: '60975ad5',
      stdin: '1987 6 30\n1987 7 31\n1987 181\n1987 212\n',
      expectedStdout: '181\n212\n6 30\n7 31\n',
    },
    // A last line with no newline.
    {
      id: 'bdfc34bd',
      stdin: '2024 2 29\n2024 60',
      expectedStdout: '60\n2 29\n',
    },
    // Every date in 1988.
    {
      id: '0a756066',
      stdin: LEAP_DATES.map((t) => t.input).join(''),
      expectedStdout: LEAP_DATES.map((t) => t.output).join(''),
    },
    // Every day of 2023.
    {
      id: '26058567',
      stdin: YEARDAYS.map((t) => t.input).join(''),
      expectedStdout: YEARDAYS.map((t) => t.output).join(''),
    },
  ],
};
