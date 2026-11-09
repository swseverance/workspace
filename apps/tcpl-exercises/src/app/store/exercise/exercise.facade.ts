import { inject, Service } from '@angular/core';
import { Store } from '@ngrx/store';
import { ExerciseSubmission } from '../../../shared/models';
import { loadChapters } from './chapters.actions';
import {
  attemptToSubmitExercise,
  codeEdited,
  openApplySubmissionModal,
} from './exercise.actions';
import {
  selectChapters,
  selectChaptersLoading,
  selectCurrentEntity,
  selectSubmissionPending,
} from './exercise.selectors';

/** What components use for exercise state. Auth and theme come from @org/auth and @org/theme. */
@Service()
export class ExerciseFacade {
  private readonly store = inject(Store);

  readonly exercise$ = this.store.select(selectCurrentEntity);
  readonly submissionPending$ = this.store.select(selectSubmissionPending);
  readonly chapters$ = this.store.select(selectChapters);
  readonly chaptersLoading$ = this.store.select(selectChaptersLoading);

  codeEdited(code: string): void {
    this.store.dispatch(codeEdited({ code }));
  }

  submitExercise(code: string): void {
    this.store.dispatch(attemptToSubmitExercise({ code }));
  }

  applySubmission(submission: ExerciseSubmission): void {
    this.store.dispatch(openApplySubmissionModal({ submission }));
  }

  loadChapters(): void {
    this.store.dispatch(loadChapters());
  }
}
