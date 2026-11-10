import { ExerciseTestCaseSource } from '../../models/exercise';
import { graderFiles, parseGraderOutput, toGradeResult } from './run-c';

const b64 = (text: string) => Buffer.from(text).toString('base64');

const TESTS: ExerciseTestCaseSource[] = [
  { id: 'a', stdin: '5', expectedStdout: '10\n' },
  { id: 'b', stdin: '0', expectedStdout: '0\n' },
];

describe('parseGraderOutput', () => {
  it('decodes each step, keeping empty fields and newlines', () => {
    const output = [
      `compile:0::${b64('warning: unused\n')}`,
      `test:0:${b64('10\n')}:`,
      `test:1::${b64('oops\n')}`,
      '',
    ].join('\n');

    expect(parseGraderOutput(output)).toEqual({
      compile: { exitCode: 0, stdout: '', stderr: 'warning: unused\n' },
      tests: [
        { exitCode: 0, stdout: '10\n', stderr: '' },
        { exitCode: 1, stdout: '', stderr: 'oops\n' },
      ],
    });
  });

  it('turns invalid UTF-8 into replacement characters instead of throwing', () => {
    const invalid = Buffer.from([0xc8]).toString('base64');

    expect(
      parseGraderOutput(`compile:0::\ntest:0:${invalid}:`).tests[0]?.stdout,
    ).toBe('�');
  });

  it('rejects output that does not start with the compile step', () => {
    expect(() => parseGraderOutput('test:0::')).toThrow(
      /Unexpected grader output/,
    );
  });
});

describe('toGradeResult', () => {
  it('passes tests that exit 0 with matching stdout, ignoring whitespace after the final newline', () => {
    const result = toGradeResult(
      {
        compile: { exitCode: 0, stdout: '', stderr: '' },
        tests: [
          { exitCode: 0, stdout: '10\n\n  \n', stderr: '' },
          { exitCode: 0, stdout: '1\n', stderr: 'debug\n' },
        ],
      },
      TESTS,
    );

    expect(result).toEqual({
      compilationError: '',
      compilerWarnings: '',
      results: [
        {
          id: 'a',
          passed: true,
          stdout: '10\n\n  \n',
          stderr: '',
          stopReason: null,
          exitCode: 0,
        },
        {
          id: 'b',
          passed: false,
          stdout: '1\n',
          stderr: 'debug\n',
          stopReason: null,
          exitCode: 0,
        },
      ],
    });
  });

  it('fails a test whose output is missing the final newline', () => {
    const result = toGradeResult(
      {
        compile: { exitCode: 0, stdout: '', stderr: '' },
        tests: [
          { exitCode: 0, stdout: '10', stderr: '' },
          { exitCode: 0, stdout: '0 \n', stderr: '' },
        ],
      },
      TESTS,
    );

    // The second has a space before its newline, which counts too.
    expect(result.results.map((r) => r.passed)).toEqual([false, false]);
  });

  it('fails a test with matching stdout but a non-zero exit code', () => {
    const { results } = toGradeResult(
      {
        compile: { exitCode: 0, stdout: '', stderr: '' },
        tests: [
          { exitCode: 3, stdout: '10\n', stderr: '' },
          { exitCode: 0, stdout: '0\n', stderr: '' },
        ],
      },
      TESTS,
    );

    expect(results.map((r) => r.passed)).toEqual([false, true]);
    expect(results.map((r) => r.exitCode)).toEqual([3, 0]);
  });

  it('reports a timeout as the stop reason', () => {
    const { results } = toGradeResult(
      {
        compile: { exitCode: 0, stdout: '', stderr: '' },
        tests: [
          { exitCode: 124, stdout: '', stderr: 'partial' },
          { exitCode: 137, stdout: '', stderr: '' },
        ],
      },
      TESTS,
    );

    expect(results.map((r) => r.stopReason)).toEqual(['timeout', 'timeout']);
    // stderr is exactly what the program wrote.
    expect(results.map((r) => r.stderr)).toEqual(['partial', '']);
    expect(results.every((r) => !r.passed)).toBe(true);
  });

  it('reports the output limit as the stop reason', () => {
    const { results } = toGradeResult(
      {
        compile: { exitCode: 0, stdout: '', stderr: '' },
        tests: [
          { exitCode: 153, stdout: 'xxxx', stderr: '' },
          { exitCode: 0, stdout: '0\n', stderr: '' },
        ],
      },
      TESTS,
    );

    expect(results[0]).toEqual({
      id: 'a',
      passed: false,
      stdout: 'xxxx',
      stderr: '',
      stopReason: 'outputLimit',
      exitCode: 153,
    });
  });

  it('reports gcc warnings when it compiles, and still runs the tests', () => {
    const warning = "main.c:4:10: warning: unknown escape sequence: '\\k'\n";
    const result = toGradeResult(
      {
        compile: { exitCode: 0, stdout: '', stderr: warning },
        tests: [
          { exitCode: 0, stdout: '10\n', stderr: '' },
          { exitCode: 0, stdout: '0\n', stderr: '' },
        ],
      },
      TESTS,
    );

    expect(result.compilationError).toBe('');
    expect(result.compilerWarnings).toBe(warning);
    expect(result.results.map((r) => r.passed)).toEqual([true, true]);
  });

  it('fails every test and reports gcc errors when compilation fails', () => {
    const result = toGradeResult(
      {
        compile: { exitCode: 1, stdout: '', stderr: 'main.c:1: error' },
        tests: [],
      },
      TESTS,
    );

    expect(result).toEqual({
      compilationError: 'main.c:1: error',
      compilerWarnings: '',
      results: [
        {
          id: 'a',
          passed: false,
          stdout: '',
          stderr: '',
          stopReason: null,
          exitCode: null,
        },
        {
          id: 'b',
          passed: false,
          stdout: '',
          stderr: '',
          stopReason: null,
          exitCode: null,
        },
      ],
    });
  });

  it('explains a compile timeout, which leaves gcc no chance to write errors', () => {
    const { compilationError } = toGradeResult(
      { compile: { exitCode: 124, stdout: '', stderr: '' }, tests: [] },
      TESTS,
    );

    expect(compilationError).toBe('Compilation timed out after 10 seconds.');
  });
});

describe('graderFiles', () => {
  it("writes each test's input, arguments, program name and files", () => {
    const files = graderFiles('int main() {}', [
      { id: 'a', args: ['2', '3', '*', 'a b', ''], expectedStdout: '6\n' },
      {
        id: 'b',
        program: 'upper',
        stdin: 'x\n',
        files: [{ name: 'a.txt', content: 'one\n' }],
        expectedStdout: '',
      },
    ]);
    const content = (path: string) =>
      files.find((file) => file.path === path)?.content;

    expect(content('main.c')).toBe('int main() {}');
    expect(content('tests/0.in')).toBe('');
    expect(content('tests/0.args')).toBe('2\x003\x00*\x00a b\x00\x00');
    expect(content('tests/1.in')).toBe('x\n');
    expect(content('tests/1.args')).toBe('');
    expect(content('tests/0.prog')).toBe('./main');
    expect(content('tests/1.prog')).toBe('upper');
    expect(content('tests/1.d/a.txt')).toBe('one\n');
  });
});
