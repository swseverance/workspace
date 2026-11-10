import { ExerciseTestCase } from '../../../shared/models';
import { diffOutput } from '../../../shared/output-diff';
import {
  describeRuntimeError,
  describeVerdict,
  formatCommandLine,
} from './test-cases';

function test(overrides: Partial<ExerciseTestCase>): ExerciseTestCase {
  return {
    id: 't',
    args: [],
    stdin: '',
    expectedStdout: '',
    actualStdout: '',
    actualStderr: '',
    stopReason: null,
    exitCode: 0,
    status: 'failed',
    ...overrides,
  };
}

describe('formatCommandLine', () => {
  it('shows the program alone with no arguments', () => {
    expect(formatCommandLine([])).toBe('./main');
  });

  it('leaves plain arguments as they are', () => {
    expect(formatCommandLine(['-r', '-n', '+4', '2.5'])).toBe(
      './main -r -n +4 2.5',
    );
  });

  it('quotes arguments a shell would change', () => {
    expect(formatCommandLine(['2', '3', '*', 'a b', "it's", ''])).toBe(
      "./main 2 3 '*' 'a b' 'it'\\''s' ''",
    );
  });
});

describe('describeRuntimeError', () => {
  it('names common crash signals', () => {
    expect(describeRuntimeError(test({ exitCode: 139 }))).toBe(
      'Crashed: segmentation fault (SIGSEGV), e.g. a bad pointer or array index. Exit code 139.',
    );
    expect(describeRuntimeError(test({ exitCode: 136 }))).toContain(
      'division by zero',
    );
  });

  it('falls back to the signal number for other signals', () => {
    expect(describeRuntimeError(test({ exitCode: 143 }))).toBe(
      'Crashed: killed by signal 15. Exit code 143.',
    );
  });

  it('explains a plain non-zero exit code', () => {
    expect(describeRuntimeError(test({ exitCode: 1 }))).toBe(
      'Exited with code 1; main must return 0.',
    );
  });

  it.each([
    ['a clean exit', { exitCode: 0 }],
    ['a test that never ran', { exitCode: null }],
    [
      'a run the sandbox stopped',
      { exitCode: 124, stopReason: 'timeout' as const },
    ],
  ])('has nothing to explain for %s', (_, overrides) => {
    expect(describeRuntimeError(test(overrides))).toBeNull();
  });
});

describe('describeVerdict', () => {
  const verdict = (overrides: Partial<ExerciseTestCase>) => {
    const t = test(overrides);
    return describeVerdict(t, diffOutput(t.expectedStdout, t.actualStdout));
  };

  it('points at the first difference for wrong output', () => {
    expect(
      verdict({ expectedStdout: '1 1 1\n', actualStdout: '1 2 1\n' }),
    ).toMatchObject({
      label: 'Wrong Answer',
      detail: 'Line 1, column 3: expected "1" but got "2".',
    });
  });

  it('puts a crash ahead of the output, noting when the output was right', () => {
    expect(
      verdict({ expectedStdout: 'a\n', actualStdout: 'a\n', exitCode: 1 }),
    ).toMatchObject({
      label: 'Runtime Error',
      detail:
        'Exited with code 1; main must return 0. Your output was correct; only the exit failed the test.',
    });
  });

  it('explains tests that were stopped or never ran', () => {
    expect(verdict({ stopReason: 'timeout', exitCode: 124 }).label).toBe(
      'Time Limit Exceeded',
    );
    expect(verdict({ exitCode: null }).label).toBe('Not Run');
    expect(verdict({ status: 'indeterminate' }).label).toBe('—');
    expect(verdict({ status: 'passed' }).label).toBe('Passed');
  });
});
