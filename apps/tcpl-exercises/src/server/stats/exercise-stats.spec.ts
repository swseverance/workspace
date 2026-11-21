import { redisProvider } from '@org/redis';
import { Redis } from '@upstash/redis';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { hmget, hgetall, hincrby, hget, exec, loggerWarn } = vi.hoisted(() => ({
  hmget: vi.fn(),
  hgetall: vi.fn(),
  hincrby: vi.fn(),
  hget: vi.fn(),
  exec: vi.fn(),
  loggerWarn: vi.fn(),
}));

vi.mock('firebase-functions/logger', () => ({ warn: loggerWarn }));

const { getAllExerciseStats, getExerciseStats, recordCompiledSubmission } =
  await import('./exercise-stats');

const KEY = 'proj:dev:tcpl:exercise-stats';

// Spec files share their modules (the Angular unit-test builder runs Vitest
// with isolate off), so the provider may already hold another spec's client.
// Providing the fake here, rather than mocking @upstash/redis, replaces it.
beforeEach(() => {
  vi.resetAllMocks();
  redisProvider.provide({
    hmget,
    hgetall,
    pipeline: () => ({ hincrby, hget, exec }),
  } as unknown as Redis);
  vi.stubEnv('PROJECT_ID', 'proj');
  vi.stubEnv('ENVIRONMENT_NAME', 'dev');
});

afterAll(() => {
  redisProvider.reset();
});

describe('getExerciseStats', () => {
  it("reads the exercise's two counts with one command", async () => {
    hmget.mockResolvedValue({ '3-1:compiled': 12, '3-1:passed': 5 });

    expect(await getExerciseStats('3-1')).toEqual({ compiled: 12, passed: 5 });
    expect(hmget).toHaveBeenCalledExactlyOnceWith(
      KEY,
      '3-1:compiled',
      '3-1:passed',
    );
  });

  it('counts an exercise nobody has submitted as zero', async () => {
    hmget.mockResolvedValue(null);

    expect(await getExerciseStats('3-1')).toEqual({ compiled: 0, passed: 0 });
  });

  it('counts a missing field as zero', async () => {
    hmget.mockResolvedValue({ '3-1:compiled': 3, '3-1:passed': null });

    expect(await getExerciseStats('3-1')).toEqual({ compiled: 3, passed: 0 });
  });

  it('gives null, and logs, when Redis fails', async () => {
    hmget.mockRejectedValue(new Error('down'));

    expect(await getExerciseStats('3-1')).toBeNull();
    expect(loggerWarn).toHaveBeenCalled();
  });
});

describe('getAllExerciseStats', () => {
  it("reads every exercise's counts with one command", async () => {
    hgetall.mockResolvedValue({
      '3-1:compiled': 12,
      '3-1:passed': 5,
      '1-13a:compiled': 4,
    });

    expect(await getAllExerciseStats()).toEqual({
      '3-1': { compiled: 12, passed: 5 },
      '1-13a': { compiled: 4, passed: 0 },
    });
    expect(hgetall).toHaveBeenCalledExactlyOnceWith(KEY);
  });

  it('is empty before the first submission', async () => {
    hgetall.mockResolvedValue(null);

    expect(await getAllExerciseStats()).toEqual({});
  });

  it('gives null, and logs, when Redis fails', async () => {
    hgetall.mockRejectedValue(new Error('down'));

    expect(await getAllExerciseStats()).toBeNull();
    expect(loggerWarn).toHaveBeenCalled();
  });
});

describe('recordCompiledSubmission', () => {
  it('adds to both counts for a submission that passed', async () => {
    exec.mockResolvedValue([13, 6]);

    expect(await recordCompiledSubmission('3-1', true)).toEqual({
      compiled: 13,
      passed: 6,
    });
    expect(hincrby.mock.calls).toEqual([
      [KEY, '3-1:compiled', 1],
      [KEY, '3-1:passed', 1],
    ]);
    expect(hget).not.toHaveBeenCalled();
  });

  it('adds to compiled only, and reads passed, for one that failed', async () => {
    exec.mockResolvedValue([13, null]);

    expect(await recordCompiledSubmission('3-1', false)).toEqual({
      compiled: 13,
      passed: 0,
    });
    expect(hincrby.mock.calls).toEqual([[KEY, '3-1:compiled', 1]]);
    expect(hget).toHaveBeenCalledExactlyOnceWith(KEY, '3-1:passed');
  });

  it('gives null, and logs, when Redis fails', async () => {
    exec.mockRejectedValue(new Error('down'));

    expect(await recordCompiledSubmission('3-1', true)).toBeNull();
    expect(loggerWarn).toHaveBeenCalled();
  });
});
