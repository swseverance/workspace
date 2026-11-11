import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_PROGRAM } from '../../shared/models';
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

describe('exercise test files', () => {
  for (const exercise of EXERCISES) {
    it(`have plain names in exercise ${exercise.id}`, () => {
      const names = exercise.tests.flatMap((test) =>
        (test.files ?? []).map((file) => file.name),
      );

      // The grader writes them inside the test's directory.
      expect(names.every((name) => /^[\w.-]+$/.test(name))).toBe(true);
      expect(names.every((name) => name !== '.' && name !== '..')).toBe(true);
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
          // Like run-c.ts: its own directory holding its files, and its
          // program name as argv[0].
          const cwd = join(dir, `${test.id}.d`);
          mkdirSync(cwd);
          for (const file of test.files ?? []) {
            writeFileSync(join(cwd, file.name), file.content);
          }

          const result = spawnSync(binPath, test.args ?? [], {
            argv0: test.program ?? DEFAULT_PROGRAM,
            cwd,
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
