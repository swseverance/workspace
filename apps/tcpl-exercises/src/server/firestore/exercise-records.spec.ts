import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExerciseRecordTestResult } from '../../models/exercise-record';
import {
  SAVED_COMPILATION_ERROR_LIMIT_BYTES,
  SAVED_OUTPUT_LIMIT_BYTES,
  saveExerciseRecordSubmission,
  truncateOutput,
} from './exercise-records';

const batch = {
  set: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

vi.mock('firebase-admin/firestore', () => {
  const doc = () => ({
    get: () => Promise.resolve({ exists: false }),
    collection: () => ({ doc: () => ({ id: 'submission-1' }) }),
  });

  return {
    getFirestore: () => ({ doc, batch: () => batch }),
    FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
    Timestamp: { now: () => ({ toDate: () => new Date(0) }) },
  };
});

const utf8Bytes = (text: string) => new TextEncoder().encode(text).length;

describe('truncateOutput', () => {
  it('leaves text within the limit alone', () => {
    expect(truncateOutput('hello', 5)).toBe('hello');
  });

  it('cuts longer text and says how much was left out', () => {
    expect(truncateOutput('a'.repeat(1_234_567), 3)).toBe(
      'aaa\n… 1,234,564 more bytes not saved',
    );
  });

  it('counts UTF-8 bytes, without splitting a character', () => {
    // '😀' is 4 bytes, so with a limit of 3 only 'a' fits.
    expect(truncateOutput('a😀b', 3)).toBe('a\n… 5 more bytes not saved');
  });
});

describe('saveExerciseRecordSubmission', () => {
  beforeEach(() => vi.clearAllMocks());

  // Ordinary text, and the U+FFFD a program printing garbage bytes decodes
  // to, which is 3 bytes of UTF-8 per character.
  for (const [name, unit] of [
    ['text', 'y\n'],
    ['garbage', '�'],
  ]) {
    it(`fits 25 tests of runaway ${name} output in the record, and returns what it saved`, async () => {
      // 64 KB characters: past the sandbox's 64 KB cap even for plain text.
      const flood = unit.repeat(64 * 1024);
      const tests: Record<string, ExerciseRecordTestResult> =
        Object.fromEntries(
          Array.from({ length: 25 }, (_, i) => [
            `test${i}`,
            {
              status: 'failed',
              actualStdout: flood,
              actualStderr: flood,
              stopReason: 'outputLimit',
              exitCode: 153,
            },
          ]),
        );

      const { record } = await saveExerciseRecordSubmission(
        'uid',
        '1-1',
        'int main() {}',
        tests,
        unit.repeat(100_000),
        { status: 'failed', passed: 0, total: 25 },
      );

      const saved = batch.set.mock.calls[0][1];
      const savedTests = Object.values(
        saved.tests,
      ) as ExerciseRecordTestResult[];
      const note = 100; // room for the note about what was cut
      let totalBytes = utf8Bytes(saved.compilationError);

      for (const test of savedTests) {
        expect(utf8Bytes(test.actualStdout)).toBeLessThan(
          SAVED_OUTPUT_LIMIT_BYTES + note,
        );
        expect(utf8Bytes(test.actualStderr)).toBeLessThan(
          SAVED_OUTPUT_LIMIT_BYTES + note,
        );
        expect(test.status).toBe('failed');
        totalBytes +=
          utf8Bytes(test.actualStdout) + utf8Bytes(test.actualStderr);
      }

      expect(utf8Bytes(saved.compilationError)).toBeLessThan(
        SAVED_COMPILATION_ERROR_LIMIT_BYTES + note,
      );
      // Well inside Firestore's 1 MiB document limit.
      expect(totalBytes).toBeLessThan(512 * 1024);
      // The response shows what a reload would.
      expect(record.tests).toEqual(saved.tests);
      expect(record.compilationError).toBe(saved.compilationError);
    });
  }
});
