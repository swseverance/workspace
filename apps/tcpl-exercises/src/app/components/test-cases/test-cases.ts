import { Component, input, signal } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ExerciseTestCase, TestStopReason } from '../../../shared/models';
import { TestCaseIo } from '../test-case-io/test-case-io';

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

@Component({
  selector: 'app-test-cases',
  imports: [NzCollapseModule, NzDividerModule, NzTagModule, TestCaseIo],
  template: `
    @if (tests().length === 0) {
      <p class="empty">No test cases</p>
    } @else {
      <nz-collapse nzAccordion>
        @for (test of tests(); track test.id; let i = $index) {
          <nz-collapse-panel
            [nzHeader]="'Test Case ' + (i + 1)"
            [nzExtra]="statusTpl"
            [nzActive]="activeTestId() === test.id"
            (nzActiveChange)="onPanelToggle(test.id, $event)"
          >
            <div class="panel-content">
              @if (activeTestId() === test.id) {
                <app-test-case-io
                  [rows]="[{ label: 'stdin', text: test.stdin }]"
                />

                <nz-divider />

                <app-test-case-io
                  [rows]="[
                    { label: 'stdout (expected)', text: test.expectedStdout },
                    {
                      label: 'stdout (actual)',
                      text: test.actualStdout,
                      pending: test.status === 'indeterminate',
                    },
                  ]"
                  [compare]="true"
                />

                @let runtimeError = describeRuntimeError(test);

                @if (test.stopReason || runtimeError || test.actualStderr) {
                  <nz-divider />
                }

                @if (runtimeError) {
                  <div class="detail-row">
                    <span class="detail-label">runtime error</span>
                    <span class="runtime-error">{{ runtimeError }}</span>
                  </div>
                }

                @if (test.stopReason) {
                  <div class="detail-row">
                    <span class="detail-label">stopped</span>
                    <span class="stopped">{{
                      stopReasonMessages[test.stopReason]
                    }}</span>
                  </div>
                }

                @if (test.actualStderr) {
                  <div class="detail-row">
                    <span class="detail-label">stderr</span>
                    <pre class="stderr">{{ test.actualStderr }}</pre>
                  </div>
                }
              }
            </div>

            <ng-template #statusTpl>
              @if (submissionPending()) {
                <nz-tag nzColor="processing">Pending...</nz-tag>
              } @else if (test.stopReason) {
                <nz-tag nzColor="warning">{{
                  stopReasonLabels[test.stopReason]
                }}</nz-tag>
              } @else if (describeRuntimeError(test)) {
                <nz-tag nzColor="error">Runtime Error</nz-tag>
              } @else {
                <nz-tag [nzColor]="statusColors[test.status]">{{
                  statusLabels[test.status]
                }}</nz-tag>
              }
            </ng-template>
          </nz-collapse-panel>
        }
      </nz-collapse>
    }
  `,
  styleUrl: './test-cases.scss',
})
export class TestCases {
  tests = input.required<ExerciseTestCase[]>();

  submissionPending = input.required<boolean>();

  protected readonly statusLabels: Record<ExerciseTestCase['status'], string> =
    {
      passed: 'Passed',
      failed: 'Failed',
      indeterminate: '—',
    };

  protected readonly statusColors: Record<
    ExerciseTestCase['status'],
    string | undefined
  > = {
    passed: 'success',
    failed: 'error',
    indeterminate: undefined,
  };

  protected readonly stopReasonLabels: Record<TestStopReason, string> = {
    timeout: 'Time Limit Exceeded',
    outputLimit: 'Output Limit Exceeded',
  };

  protected readonly stopReasonMessages: Record<TestStopReason, string> = {
    timeout: 'The program ran too long and was stopped.',
    outputLimit: 'The program wrote too much output and was stopped.',
  };

  protected readonly describeRuntimeError = describeRuntimeError;

  protected readonly activeTestId = signal<string | null>(null);

  protected onPanelToggle(id: string, active: boolean): void {
    this.activeTestId.update((current) =>
      active ? id : current === id ? null : current,
    );
  }
}
