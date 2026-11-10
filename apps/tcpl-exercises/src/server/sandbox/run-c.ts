import { Sandbox } from '@vercel/sandbox';
import * as logger from 'firebase-functions/logger';
import { ExerciseTestCaseSource } from '../../models/exercise';
import { ExerciseTestResult } from '../../models/exercise-submission';
import { TestStopReason } from '../../shared/models';
import { normalizeOutput } from '../../shared/output-diff';

const SANDBOX_DIR = '/vercel/sandbox';

const COMPILE_TIMEOUT_S = 10;

// A correct run takes ~5ms (measured in the sandbox: median 4.8ms, slowest
// 15ms of 420 runs, wrapper included), so 250ms is ~16x the worst case
// seen while keeping infinite loops quick to report.
const RUN_TIMEOUT_MS = 250;
// Extra time before SIGKILL for a program that ignores timeout's SIGTERM.
const RUN_KILL_GRACE_MS = 500;
const SANDBOX_TIMEOUT_MS = 60_000;

// Per-stream cap on what a test run may write: a runaway printf loop would
// otherwise produce hundreds of MB.
const OUTPUT_LIMIT_KB = 64;

// `timeout` exits with 124 when it stops a command, or 137 if it had to
// SIGKILL one that ignored SIGTERM.
const TIMED_OUT_EXIT_CODES = new Set([124, 137]);

// 128 + SIGXFSZ: killed for writing past the ulimit -f cap.
const OUTPUT_LIMIT_EXIT_CODE = 153;

/**
 * Runs in the sandbox: compiles once, then runs every test, all in a single
 * command, so grading costs one round trip instead of one per test. Prints
 * one line per step, `<step>:<exit code>:<base64 stdout>:<base64 stderr>`;
 * base64 keeps arbitrary bytes and newlines intact, and its alphabet has no
 * colon.
 *
 * -std=c17 rather than gcc's default GNU dialect: in strict ISO mode glibc leaves
 * out POSIX extras such as getline and strdup, which the book defines
 * itself with different signatures.
 *
 * -lm links the math library, which glibc keeps separate from libc, so
 * <math.h> functions such as sin and pow (chapter 4) can be used.
 *
 * Each test's arguments come from tests/<i>.args, NUL-terminated, read
 * into an array so they reach main as given: no quoting, splitting or
 * globbing (expr 2 3 '*' needs a literal *).
 */
const GRADE_SCRIPT = `
b64() { base64 -w0 "$1"; }

timeout -k 1 ${COMPILE_TIMEOUT_S} gcc -Wall -std=c17 -o main main.c -lm > compile.out 2> compile.err
code=$?
echo "compile:$code:$(b64 compile.out):$(b64 compile.err)"
[ "$code" -eq 0 ] || exit 0

for ((i = 0; i < $1; i++)); do
  # ulimit -f caps each output file; a program exceeding it is killed.
  mapfile -d '' -t args < "tests/$i.args"
  ( ulimit -f ${OUTPUT_LIMIT_KB}
    timeout -k ${RUN_KILL_GRACE_MS / 1000} ${RUN_TIMEOUT_MS / 1000} ./main "\${args[@]}" < "tests/$i.in" > "tests/$i.out" 2> "tests/$i.err" )
  code=$?
  echo "test:$code:$(b64 "tests/$i.out"):$(b64 "tests/$i.err")"
done
`;

type StepResult = { exitCode: number; stdout: string; stderr: string };

type GraderOutput = { compile: StepResult; tests: StepResult[] };

export type GradeResult = {
  /** gcc's errors, or '' when it compiled. */
  compilationError: string;
  /** gcc's warnings when it compiled, or ''. */
  compilerWarnings: string;
  results: ExerciseTestResult[];
};

function decode(field: string): string {
  // Invalid UTF-8 from the program becomes U+FFFD instead of throwing.
  return Buffer.from(field, 'base64').toString('utf8');
}

/** Parses GRADE_SCRIPT's output. Exported for tests. */
export function parseGraderOutput(output: string): GraderOutput {
  const steps = output
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => {
      const [step, exitCode, stdout = '', stderr = ''] = line.split(':');
      const result: StepResult = {
        exitCode: Number(exitCode),
        stdout: decode(stdout),
        stderr: decode(stderr),
      };
      return { step, result };
    });

  const [compile, ...tests] = steps;

  if (compile?.step !== 'compile' || tests.some((t) => t.step !== 'test')) {
    throw new Error(`Unexpected grader output: ${output.slice(0, 200)}`);
  }

  return { compile: compile.result, tests: tests.map((t) => t.result) };
}

/** Why the sandbox stopped a run, if it did. */
function stopReason(exitCode: number): TestStopReason | null {
  if (TIMED_OUT_EXIT_CODES.has(exitCode)) {
    return 'timeout';
  }

  return exitCode === OUTPUT_LIMIT_EXIT_CODE ? 'outputLimit' : null;
}

function compareOutput(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

/** Turns the grader's per-step output into what's stored and shown. */
export function toGradeResult(
  { compile, tests: runs }: GraderOutput,
  tests: ExerciseTestCaseSource[],
): GradeResult {
  if (compile.exitCode !== 0) {
    const timedOut = TIMED_OUT_EXIT_CODES.has(compile.exitCode);

    return {
      compilationError:
        compile.stderr ||
        (timedOut
          ? `Compilation timed out after ${COMPILE_TIMEOUT_S} seconds.`
          : `Compilation failed (exit code ${compile.exitCode}).`),
      compilerWarnings: '',
      results: tests.map((test) => ({
        id: test.id,
        passed: false,
        stdout: '',
        stderr: '',
        stopReason: null,
        exitCode: null,
      })),
    };
  }

  return {
    compilationError: '',
    compilerWarnings: compile.stderr,
    results: tests.map((test, i) => {
      const run = runs[i];

      if (!run) {
        throw new Error(`Grader returned no result for test ${test.id}`);
      }

      return {
        id: test.id,
        passed:
          run.exitCode === 0 && compareOutput(run.stdout, test.expectedStdout),
        stdout: run.stdout,
        stderr: run.stderr,
        stopReason: stopReason(run.exitCode),
        exitCode: run.exitCode,
      };
    }),
  };
}

/**
 * Credentials for the Vercel API. When unset, the SDK falls back to the
 * `VERCEL_OIDC_TOKEN` it finds in the environment (only available when this
 * server itself runs on Vercel), so this stays empty outside that case.
 */
function getCredentials():
  { teamId: string; projectId: string; token: string } | object {
  const teamId = process.env['VERCEL_TEAM_ID'];
  const projectId = process.env['VERCEL_PROJECT_ID'];
  const token = process.env['VERCEL_TOKEN'];

  return teamId && projectId && token ? { teamId, projectId, token } : {};
}

/**
 * The files GRADE_SCRIPT reads, relative to SANDBOX_DIR: the source, the
 * script itself, and each test's input and arguments. Exported for tests.
 */
export function graderFiles(
  code: string,
  tests: ExerciseTestCaseSource[],
): { path: string; content: string }[] {
  return [
    { path: 'main.c', content: code },
    { path: 'grade.sh', content: GRADE_SCRIPT },
    ...tests.flatMap((test, i) => [
      { path: `tests/${i}.in`, content: test.stdin ?? '' },
      {
        path: `tests/${i}.args`,
        content: (test.args ?? []).map((arg) => `${arg}\0`).join(''),
      },
    ]),
  ];
}

/**
 * Compiles untrusted C source inside an isolated, network-less Vercel
 * Sandbox microVM and runs it once per test case, with that test's
 * arguments and stdin, capturing its stdout and stderr.
 */
export async function gradeSubmission(
  code: string,
  tests: ExerciseTestCaseSource[],
): Promise<GradeResult> {
  const sandbox = await Sandbox.create({
    ...getCredentials(),
    image: 'vercel/sandbox/arch', // ships gcc preinstalled (base-devel), no apt/install step needed
    resources: { vcpus: 1 },
    timeout: SANDBOX_TIMEOUT_MS,
    networkPolicy: 'deny-all',
    persistent: false,
  });

  try {
    await sandbox.writeFiles(
      graderFiles(code, tests).map(({ path, content }) => ({
        path: `${SANDBOX_DIR}/${path}`,
        content,
      })),
    );

    const finished = await sandbox.runCommand({
      cmd: 'bash',
      args: ['grade.sh', String(tests.length)],
      cwd: SANDBOX_DIR,
    });

    if (finished.exitCode !== 0) {
      throw new Error(
        `Grader exited with ${finished.exitCode}: ${await finished.stderr()}`,
      );
    }

    return toGradeResult(parseGraderOutput(await finished.stdout()), tests);
  } finally {
    // Takes about a second and the result doesn't depend on it, so don't
    // make the user wait. If it fails, the sandbox's timeout still ends it.
    sandbox.stop().catch((error: unknown) => {
      logger.warn('[sandbox] stop failed', { error });
    });
  }
}
