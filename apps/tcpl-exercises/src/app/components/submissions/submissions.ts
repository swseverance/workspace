import { Component, computed, input, output, signal } from '@angular/core';
import type { ThemeMode } from '@org/theme';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ExerciseStatus, ExerciseSubmission } from '../../../shared/models';
import { LocalDatePipe } from '../../pipes/local-date-pipe';
import { CodeEditor } from '../code-editor/code-editor';
import { Status, StatusColor } from '../status/status';

const STATUS_TAGS: Partial<
  Record<ExerciseStatus, { label: string; color: StatusColor }>
> = {
  passed: { label: 'Passed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
};

@Component({
  selector: 'app-submissions',
  imports: [
    LocalDatePipe,
    NzButtonModule,
    NzCollapseModule,
    CodeEditor,
    Status,
  ],
  templateUrl: './submissions.html',
  styleUrl: './submissions.scss',
})
export class Submissions {
  submissions = input.required<ExerciseSubmission[]>();

  theme = input.required<ThemeMode>();

  apply = output<ExerciseSubmission>();

  protected readonly activeId = signal<string | null>(null);

  /** The open submission; only its panel renders an editor. */
  protected readonly active = computed(
    () => this.submissions().find((s) => s.id === this.activeId()) ?? null,
  );

  protected tagFor(submission: ExerciseSubmission) {
    return STATUS_TAGS[submission.status];
  }

  protected onPanelToggle(id: string, active: boolean): void {
    this.activeId.update((current) =>
      active ? id : current === id ? null : current,
    );
  }
}
