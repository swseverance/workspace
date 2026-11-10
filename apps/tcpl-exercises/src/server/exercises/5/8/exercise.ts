import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const DAY = 24 * 60 * 60 * 1000;

// Every month and day from 1 to 31 in 1900, which isn't a leap year:
// the day of the year, or error for a date that doesn't exist.
const ALL_DATES = Array.from({ length: 12 * 31 }, (_, i) => {
  const month = Math.floor(i / 31) + 1;
  const day = (i % 31) + 1;
  const date = new Date(Date.UTC(1900, month - 1, day));
  const exists = date.getUTCMonth() === month - 1;
  const yearday = (date.getTime() - Date.UTC(1900, 0, 1)) / DAY + 1;

  return {
    input: `1900 ${month} ${day}\n`,
    output: exists ? `${yearday}\n` : 'error\n',
  };
});

// Every day of 2000, a leap year, and the day either side.
const ALL_YEARDAYS = Array.from({ length: 368 }, (_, yearday) => {
  const date = new Date(Date.UTC(2000, 0, yearday));
  const exists = yearday >= 1 && yearday <= 366;

  return {
    input: `2000 ${yearday}\n`,
    output: exists
      ? `${date.getUTCMonth() + 1} ${date.getUTCDate()}\n`
      : 'error\n',
  };
});

export const exercise5_8: ExerciseSource = {
  id: '5-8',
  chapter: 5,
  number: 8,
  title: 'Date conversion with error checking',
  summary:
    'Add error checking to day_of_year and month_day, which convert between dates and days of the year. K&R exercise 5-8, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: '80a295f4', expectedStdout: '' },
    // The book's example: February 29th, 1988 is day 60.
    {
      id: '313e9a22',
      stdin: '1988 2 29\n1988 60\n',
      expectedStdout: '60\n2 29\n',
    },
    // March 1st in a leap year and a non-leap year.
    {
      id: '57e04d9c',
      stdin: '1987 3 1\n1988 3 1\n',
      expectedStdout: '60\n61\n',
    },
    // The first and last days of the year.
    {
      id: '2556d21f',
      stdin: '1987 1 1\n1987 12 31\n1988 12 31\n',
      expectedStdout: '1\n365\n366\n',
    },
    // The first and last days of the year, the other way.
    {
      id: '183d0795',
      stdin: '1987 1\n1987 365\n1988 366\n',
      expectedStdout: '1 1\n12 31\n12 31\n',
    },
    // 1900 isn't a leap year; 2000 is.
    {
      id: 'abf10875',
      stdin: '1900 2 29\n2000 2 29\n',
      expectedStdout: 'error\n60\n',
    },
    // Months that don't exist.
    {
      id: '1a8fab1f',
      stdin: '1987 0 1\n1987 13 1\n1987 -1 1\n',
      expectedStdout: 'error\nerror\nerror\n',
    },
    // Days that don't exist in their month.
    {
      id: '5c62d009',
      stdin: '1987 4 31\n1987 1 0\n1987 2 29\n1987 3 -1\n',
      expectedStdout: 'error\nerror\nerror\nerror\n',
    },
    // Days of the year that don't exist.
    {
      id: '382e1705',
      stdin: '1987 0\n1987 366\n1988 367\n1987 -5\n',
      expectedStdout: 'error\nerror\nerror\nerror\n',
    },
    // A last line with no newline.
    {
      id: 'e3a90689',
      stdin: '2024 2 29\n2024 60',
      expectedStdout: '60\n2 29\n',
    },
    // Days 1 to 31 of every month in 1900.
    {
      id: '1b93f625',
      stdin: ALL_DATES.map((t) => t.input).join(''),
      expectedStdout: ALL_DATES.map((t) => t.output).join(''),
    },
    // Days 0 to 367 of 2000.
    {
      id: '7ef9233e',
      stdin: ALL_YEARDAYS.map((t) => t.input).join(''),
      expectedStdout: ALL_YEARDAYS.map((t) => t.output).join(''),
    },
  ],
};
