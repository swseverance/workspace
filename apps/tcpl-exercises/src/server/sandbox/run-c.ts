import { Command, CommandFinished, Sandbox } from '@vercel/sandbox';
import { Readable } from 'node:stream';
import { ExerciseTestCaseSource } from '../../models/exercise';
import { ExerciseTestResult } from '../../models/exercise-submission';
import { RunCResponse } from '../../models/run-c';

const SANDBOX_DIR = '/vercel/sandbox';
const COMPILE_TIMEOUT_MS = 15_000;
const RUN_TIMEOUT_MS = 10_000;

type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
};

async function runWithTimeout(
  sandbox: Sandbox,
  params: { cmd: string; args?: string[]; input?: string },
  timeoutMs: number,
): Promise<CommandResult> {
  const { input, ...rest } = params;

  const command: Command = await sandbox.runCommand({
    ...rest,
    cwd: SANDBOX_DIR,
    detached: true,
    stdin: input !== undefined ? Readable.from(input) : undefined,
  });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void command.kill('SIGKILL');
  }, timeoutMs);

  let finished: CommandFinished;
  try {
    finished = await command.wait();
  } finally {
    clearTimeout(timer);
  }

  const [stdout, stderr] = await Promise.all([
    finished.stdout(),
    finished.stderr(),
  ]);
  return { stdout, stderr, exitCode: finished.exitCode, timedOut };
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

function compareOutput(actual: string, expected: string): boolean {
  return actual.trimEnd() === expected.trimEnd();
}

/**
 * Compiles untrusted C source inside an isolated, network-less Vercel Sandbox
 * microVM, then runs it once per test case (feeding that test's stdin and
 * comparing stdout against its expected output), before tearing the sandbox
 * down.
 */
export async function gradeSubmission(
  code: string,
  tests: ExerciseTestCaseSource[],
): Promise<{ compile: RunCResponse; results: ExerciseTestResult[] }> {
  const sandbox = await Sandbox.create({
    ...getCredentials(),
    image: 'vercel/sandbox/arch', // ships gcc preinstalled (base-devel), no apt/install step needed
    resources: { vcpus: 1 },
    timeout: 60_000,
    networkPolicy: 'deny-all',
    persistent: false,
  });

  try {
    await sandbox.writeFiles([
      { path: `${SANDBOX_DIR}/main.c`, content: code },
    ]);

    const compile = await runWithTimeout(
      sandbox,
      { cmd: 'gcc', args: ['-Wall', '-o', 'main', 'main.c'] },
      COMPILE_TIMEOUT_MS,
    );

    if (compile.timedOut || compile.exitCode !== 0) {
      const results: ExerciseTestResult[] = tests.map((test) => ({
        id: test.id,
        passed: false,
        stdout: '',
      }));

      return { compile: { stage: 'compile', ...compile }, results };
    }

    const results: ExerciseTestResult[] = [];

    for (const test of tests) {
      const run = await runWithTimeout(
        sandbox,
        { cmd: './main', input: test.stdin ?? '' },
        RUN_TIMEOUT_MS,
      );

      results.push({
        id: test.id,
        passed:
          !run.timedOut &&
          run.exitCode === 0 &&
          compareOutput(run.stdout, test.expectedStdout),
        stdout: run.stdout,
      });
    }

    return { compile: { stage: 'compile', ...compile }, results };
  } finally {
    await sandbox.stop();
  }
}
