import { ExerciseTestCase } from '../../../shared/models';
import { describeRuntimeError } from './test-cases';

function test(overrides: Partial<ExerciseTestCase>): ExerciseTestCase {
  return {
    id: 't',
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
