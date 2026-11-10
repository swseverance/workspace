import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EXERCISES } from './index';

// The grader compiles with -std=c17 (see run-c.ts), where glibc's headers
// leave out POSIX extras like getline that the book defines itself. macOS
// headers ignore -std for this, so ask them for plain ANSI C here.
const MACOS_STRICT_HEADERS =
  process.platform === 'darwin' ? ['-D_ANSI_SOURCE'] : [];

describe('exercise test ids', () => {
  for (const exercise of EXERCISES) {
    it(`are 8 hex digits and unique within exercise ${exercise.id}`, () => {
      const ids = exercise.tests.map((test) => test.id);

      expect(exercise.tests.length).toBeGreaterThan(0);
      expect(ids.every((id) => /^[0-9a-f]{8}$/.test(id))).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }
});

describe('exercise metadata', () => {
  for (const exercise of EXERCISES) {
    it(`is complete for exercise ${exercise.id}`, () => {
      const { chapter, number, suffix } = exercise;

      expect(exercise.id).toBe(`${chapter}-${number}${suffix ?? ''}`);
      expect(exercise.title.trim()).not.toBe('');
      expect(exercise.summary.trim()).not.toBe('');
      // Search results cut meta descriptions off at about this length.
      expect(exercise.summary.length).toBeLessThanOrEqual(160);
    });
  }
});

describe('exercise solutions', () => {
  for (const exercise of EXERCISES) {
    describe(`Exercise ${exercise.id}`, () => {
      let binPath: string;
      let dir: string;

      beforeAll(() => {
        dir = mkdtempSync(join(tmpdir(), 'tcpl-exercise-'));
        writeFileSync(join(dir, 'main.c'), exercise.solution);
        binPath = join(dir, 'main');

        const compile = spawnSync(
          'gcc',
          [
            '-Wall',
            '-std=c17',
            ...MACOS_STRICT_HEADERS,
            '-o',
            binPath,
            join(dir, 'main.c'),
            '-lm', // as in run-c.ts
          ],
          { encoding: 'utf8' },
        );

        // Warnings fail too: a reference solution should compile cleanly.
        expect(compile.stderr).toBe('');
        expect(compile.status).toBe(0);
      });

      afterAll(() => {
        rmSync(dir, { recursive: true, force: true });
      });

      exercise.tests.forEach((test) => {
        it(`passes test case ${test.id}`, () => {
          const result = spawnSync(binPath, [], {
            input: test.stdin ?? '',
            encoding: 'utf8',
            timeout: 5000,
          });

          expect(result.stdout).toBe(test.expectedStdout);
        });
      });
    });
  }
});
