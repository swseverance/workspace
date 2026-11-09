import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Theme } from '@org/theme';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { ExerciseSubmission } from '../../../shared/models';
import { CodeEditor } from '../code-editor/code-editor';

export type SubmissionCodeData = { submission: ExerciseSubmission };

/** A submission's code, read-only. Shown as a modal's content. */
@Component({
  selector: 'app-submission-code',
  imports: [AsyncPipe, CodeEditor],
  template: `
    <app-code-editor
      [docId]="submission.id"
      [code]="submission.code"
      [theme]="(theme$ | async)!"
      [readonly]="true"
    />
  `,
  styles: `
    :host {
      height: 60vh;
      display: flex;
      flex-direction: column;
    }

    app-code-editor {
      flex: 1;
      min-height: 0;
    }
  `,
})
export class SubmissionCode {
  protected readonly submission =
    inject<SubmissionCodeData>(NZ_MODAL_DATA).submission;

  protected readonly theme$ = inject(Theme).mode$;
}
