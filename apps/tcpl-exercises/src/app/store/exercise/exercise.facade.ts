import { inject, Service } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadChapters } from './chapters.actions';
import {
  attemptToSubmitExercise,
  codeEdited,
  selectExercise,
} from './exercise.actions';
import {
  selectChapters,
  selectChaptersLoading,
  selectExercise as selectExerciseSelector,
  selectShowExerciseSkeleton,
  selectSubmissionPending,
} from './exercise.selectors';

/** What components use for exercise state. Auth and theme come from @org/auth and @org/theme. */
@Service()
export class ExerciseFacade {
  private readonly store = inject(Store);

  readonly exercise$ = this.store.select(selectExerciseSelector);
  readonly exerciseLoading$ = this.store.select(selectShowExerciseSkeleton);
  readonly submissionPending$ = this.store.select(selectSubmissionPending);
  readonly chapters$ = this.store.select(selectChapters);
  readonly chaptersLoading$ = this.store.select(selectChaptersLoading);

  selectExercise(id: string): void {
    this.store.dispatch(selectExercise({ id }));
  }

  codeEdited(code: string): void {
    this.store.dispatch(codeEdited({ code }));
  }

  submitExercise(code: string): void {
    this.store.dispatch(attemptToSubmitExercise({ code }));
  }

  loadChapters(): void {
    this.store.dispatch(loadChapters());
  }
}
