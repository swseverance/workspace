import { Component, computed, input, signal } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ExerciseTestCase } from '../../../shared/models';
import {
  describeFirstDifference,
  diffOutput,
  DiffRow,
} from '../../../shared/output-diff';
import { OutputDiff } from '../output-diff/output-diff';
import { Status, StatusColor } from '../status/status';
import { TextBlock } from '../text-block/text-block';

// A process killed by a signal exits with 128 + the signal number.
const SIGNALS: Record<number, string> = {
  6: 'aborted (SIGABRT), e.g. a failed assert()',
  7: 'bus error (SIGBUS)',
  8: 'arithmetic error (SIGFPE), e.g. division by zero',
  11: 'segmentation fault (SIGSEGV), e.g. a bad pointer or array index',
};

/**
 * Explains a non-zero exit that wasn't the sandbox stopping the program
 * (those have a stopReason), or null if there's nothing to explain.
 */
/**
 * How a test's program is run, as a shell command line that can be pasted
 * as is: arguments a shell would change (blanks, quotes, *) are quoted.
 */
export function formatCommandLine(args: string[]): string {
  const quote = (arg: string) =>
    /^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`;

  return ['./main', ...args.map(quote)].join(' ');
}

export function describeRuntimeError(test: ExerciseTestCase): string | null {
  const { exitCode, stopReason } = test;

  if (stopReason || exitCode === null || exitCode === 0) {
    return null;
  }

  if (exitCode > 128) {
    const signal = exitCode - 128;
    const name = SIGNALS[signal] ?? `killed by signal ${signal}`;
    return `Crashed: ${name}. Exit code ${exitCode}.`;
  }

  return `Exited with code ${exitCode}; main must return 0.`;
}

export type VerdictTone = 'success' | 'info' | 'warning' | 'error';

export type Verdict = {
  tone: VerdictTone;
  /** Short label for the panel header. */
  label: string;
  title: string;
  detail: string | null;
};

/** The single most useful explanation of how a test went. */
export function describeVerdict(
  test: ExerciseTestCase,
  rows: DiffRow[],
): Verdict {
  if (test.status === 'indeterminate') {
    return {
      tone: 'info',
      label: '—',
      title: 'Not run yet',
      detail: 'Submit your solution to see what your program prints.',
    };
  }

  if (test.status === 'passed') {
    return {
      tone: 'success',
      label: 'Passed',
      title: 'Passed',
      detail: null,
    };
  }

  if (test.exitCode === null) {
    return {
      tone: 'error',
      label: 'Not Run',
      title: "Didn't run",
      detail: 'Your program failed to compile. See the Compilation Errors tab.',
    };
  }

  if (test.stopReason === 'timeout') {
    return {
      tone: 'warning',
      label: 'Time Limit Exceeded',
      title: 'Time limit exceeded',
      detail:
        'Your program ran too long and was stopped. Look for a loop that never ends.',
    };
  }

  if (test.stopReason === 'outputLimit') {
    return {
      tone: 'warning',
      label: 'Output Limit Exceeded',
      title: 'Output limit exceeded',
      detail:
        'Your program printed too much and was stopped, often a sign of a loop that never ends.',
    };
  }

  const outputMatches = rows.every((row) => row.kind === 'equal');
  const runtimeError = describeRuntimeError(test);

  if (runtimeError) {
    return {
      tone: 'error',
      label: 'Runtime Error',
      title: 'Runtime error',
      detail: outputMatches
        ? `${runtimeError} Your output was correct; only the exit failed the test.`
        : runtimeError,
    };
  }

  return {
    tone: 'error',
    label: 'Wrong Answer',
    title: 'Wrong answer',
    detail: describeFirstDifference(rows),
  };
}

const TAG_COLORS: Record<VerdictTone, StatusColor> = {
  success: 'success',
  info: 'default',
  warning: 'warning',
  error: 'error',
};

@Component({
  selector: 'app-test-cases',
  imports: [NzAlertModule, NzCollapseModule, OutputDiff, Status, TextBlock],
  templateUrl: './test-cases.html',
  styleUrl: './test-cases.scss',
})
export class TestCases {
  tests = input.required<ExerciseTestCase[]>();

  submissionPending = input.required<boolean>();

  protected readonly tagColors = TAG_COLORS;

  protected readonly formatCommandLine = formatCommandLine;

  protected readonly activeTestId = signal<string | null>(null);

  /** Header labels for every test; the label doesn't depend on the diff. */
  protected readonly verdicts = computed(
    () =>
      new Map(this.tests().map((test) => [test.id, describeVerdict(test, [])])),
  );

  /** Everything the open panel shows, computed once per change. */
  protected readonly active = computed(() => {
    const test = this.tests().find((t) => t.id === this.activeTestId());

    if (!test) {
      return null;
    }

    const rows =
      test.status === 'failed' && test.exitCode !== null
        ? diffOutput(test.expectedStdout, test.actualStdout)
        : [];

    return { test, rows, verdict: describeVerdict(test, rows) };
  });

  protected onPanelToggle(id: string, active: boolean): void {
    this.activeTestId.update((current) =>
      active ? id : current === id ? null : current,
    );
  }
}
