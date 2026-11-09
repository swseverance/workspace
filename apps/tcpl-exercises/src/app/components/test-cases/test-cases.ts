import { Component, input, signal } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ExerciseTestCase } from '../../../shared/models';
import { TestCaseIo } from '../test-case-io/test-case-io';

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
              }
            </div>

            <ng-template #statusTpl>
              @if (submissionPending()) {
                <nz-tag nzColor="processing">Pending...</nz-tag>
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

  protected readonly activeTestId = signal<string | null>(null);

  protected onPanelToggle(id: string, active: boolean): void {
    this.activeTestId.update((current) =>
      active ? id : current === id ? null : current,
    );
  }
}
