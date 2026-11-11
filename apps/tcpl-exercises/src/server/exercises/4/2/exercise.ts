import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

export const exercise4_2: ExerciseSource = {
  id: '4-2',
  chapter: 4,
  number: 2,
  title: 'atof with scientific notation',
  summary:
    'Extend atof to convert numbers in scientific notation, like 123.45e-6, to doubles. K&R exercise 4-2, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'a70ed585', expectedStdout: '' },
    // The example.
    { id: '9c78f199', stdin: '123.45e-6\n', expectedStdout: '0.00012345\n' },
    // No exponent, as before.
    {
      id: '97c24a37',
      stdin: '3.14\n-2\n.5\n42.\n',
      expectedStdout: '3.14\n-2\n0.5\n42\n',
    },
    // A positive exponent.
    { id: '1b26dcc6', stdin: '1.5e3\n2e2\n', expectedStdout: '1500\n200\n' },
    // Upper case E, and an exponent with a + sign.
    {
      id: '57ab4351',
      stdin: '1.5E3\n1.5e+3\n',
      expectedStdout: '1500\n1500\n',
    },
    // A negative exponent.
    { id: 'c1084263', stdin: '25e-1\n5e-1\n', expectedStdout: '2.5\n0.5\n' },
    // Signs on both the number and the exponent.
    {
      id: 'e2842b2f',
      stdin: '-1.5e-2\n+1.5e+2\n-.5E1\n',
      expectedStdout: '-0.015\n150\n-5\n',
    },
    // A zero exponent, and leading zeros in the exponent.
    {
      id: '180f1e52',
      stdin: '7e0\n7e-00\n7e003\n',
      expectedStdout: '7\n7\n7000\n',
    },
    // Leading blanks and tabs.
    {
      id: 'f67db6d3',
      stdin: '   4.5e1\n\t-4.5e1\n',
      expectedStdout: '45\n-45\n',
    },
    // Large and small numbers.
    {
      id: '78e8e7ff',
      stdin: '1e10\n6.02e23\n1.6e-19\n',
      expectedStdout: '1e+10\n6.02e+23\n1.6e-19\n',
    },
    // Exponents in the hundreds.
    {
      id: 'dc65049b',
      stdin: '1e300\n1e-300\n',
      expectedStdout: '1e+300\n1e-300\n',
    },
    // A last line with no newline.
    { id: '484ab6a3', stdin: '1\n2.5e3', expectedStdout: '1\n2500\n' },
    // 300 digits before or after the point, cancelled by the exponent.
    {
      id: 'accb6ac6',
      stdin:
        '1' + '0'.repeat(300) + 'e-300\n' + '0.' + '0'.repeat(299) + '1e300\n',
      expectedStdout: '1\n1\n',
    },
  ],
};
