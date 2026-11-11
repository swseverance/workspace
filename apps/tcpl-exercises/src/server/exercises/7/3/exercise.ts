import { ExerciseSource } from '../../../../models/exercise';
import description from './description.md' with { type: 'text' };
import solution from './main.c' with { type: 'text' };

const NUMBERS = Array.from({ length: 1000 }, (_, i) => i);

export const exercise7_3: ExerciseSource = {
  id: '7-3',
  chapter: 7,
  number: 3,
  title: 'A fuller minprintf',
  summary:
    'Extend minprintf with more of printf: flags, field widths, precisions and more conversions. K&R exercise 7-3, solved and tested in your browser.',
  description,
  solution,
  tests: [
    // Empty input.
    { id: 'f1104a86', expectedStdout: '' },
    // Plain conversions, with text around them.
    {
      id: '81eb9c20',
      stdin: 'n=%d!\t42\n%i\t-9\n%s\thello world\n',
      expectedStdout: 'n=42!\n-9\nhello world\n',
    },
    // Field widths, right and left justified.
    {
      id: '4f6a31c6',
      stdin: '[%5d]\t42\n[%-5d]\t42\n[%-8s]\thi\n',
      expectedStdout: '[   42]\n[42   ]\n[hi      ]\n',
    },
    // Zero padding, signs and blanks.
    {
      id: 'c19443df',
      stdin: '[%05d]\t-42\n[%+d]\t7\n[% d]\t7\n[%+05d]\t7\n',
      expectedStdout: '[-0042]\n[+7]\n[ 7]\n[+0007]\n',
    },
    // Octal, hexadecimal and unsigned.
    {
      id: '837de5e4',
      stdin: '%o\t8\n%x\t255\n%X\t255\n%u\t4294967295\n',
      expectedStdout: '10\nff\nFF\n4294967295\n',
    },
    // The # flag.
    {
      id: '327ff1db',
      stdin: '%#o\t8\n%#x\t255\n%#X\t255\n',
      expectedStdout: '010\n0xff\n0XFF\n',
    },
    // Characters.
    {
      id: 'ea4ff20b',
      stdin: '[%c]\tA\n[%3c]\tz\n',
      expectedStdout: '[A]\n[  z]\n',
    },
    // A precision on a string and an integer.
    {
      id: 'd8020955',
      stdin: '[%.3s]\thello\n[%6.2s]\thello\n[%.4d]\t7\n',
      expectedStdout: '[hel]\n[    he]\n[0007]\n',
    },
    // Floating point.
    {
      id: '1e05ae8f',
      stdin:
        '%f\t3.14159\n%.2f\t3.14159\n[%10.3f]\t-1.5\n%e\t12345.678\n%E\t0.000123\n%g\t0.0001\n%G\t1e-10\n%g\t100000\n%g\t1000000\n',
      expectedStdout:
        '3.141590\n3.14\n[    -1.500]\n1.234568e+04\n1.230000E-04\n0.0001\n1E-10\n100000\n1e+06\n',
    },
    // %% alone and with a conversion.
    {
      id: '5aac57b1',
      stdin: '100%%\t\n%d%%\t50\n',
      expectedStdout: '100%\n50%\n',
    },
    // A last line with no newline.
    { id: 'd61d6669', stdin: '%d\t1', expectedStdout: '1\n' },
    // A 300-character field.
    {
      id: '9ad6ae9e',
      stdin: '[%300d]\t1\n[%-300s]\tx\n',
      expectedStdout:
        '[' + ' '.repeat(299) + '1]\n[x' + ' '.repeat(299) + ']\n',
    },
    // 1000 lines.
    {
      id: 'b616772c',
      stdin: NUMBERS.map((n) => `%04d\t${n}\n`).join(''),
      expectedStdout: NUMBERS.map(
        (n) => `${String(n).padStart(4, '0')}\n`,
      ).join(''),
    },
  ],
};
