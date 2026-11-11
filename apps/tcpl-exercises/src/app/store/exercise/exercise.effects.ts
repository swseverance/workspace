import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthActions, authFeature } from '@org/auth';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  catchError,
  filter,
  from,
  interval,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ExerciseService } from '../../services/exercise-service';
import {
  attemptToSubmitExercise,
  exerciseNavigationFailed,
  exerciseRefreshed,
  exercisesReset,
  exerciseSubmitted,
  pendingChangesSaved,
  refreshExerciseFailed,
  savePendingChanges,
  savePendingChangesFailure,
  submitExercise,
  submitExerciseFailed,
} from './exercise.actions';
import {
  selectExercisesWithPendingChanges,
  selectId,
} from './exercise.selectors';

const SAVE_INTERVAL_MS = 10_000;

@Injectable()
export class ExerciseEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private exercise = inject(ExerciseService);
  private message = inject(NzMessageService);
  private logger = inject(Logger);
  private router = inject(Router);

  /**
   * Leave the exercise pages and then drop their data, so the next person
   * doesn't see it and autosave can't send it to another account. Navigating
   * first keeps the pages from rendering empty; coming back refetches.
   */
  sessionEnded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sessionEnded),
      switchMap(() =>
        this.router.navigateByUrl('/').then(() => exercisesReset()),
      ),
    ),
  );

  /**
   * A new session cookie means the shown exercise was fetched signed out,
   * without the user's code and results, so fetch it again.
   */
  refreshExercise$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.cookieCreated),
      withLatestFrom(this.store.select(selectId)),
      filter(([, id]) => id !== ''),
      switchMap(([, id]) =>
        this.exercise.getExercise(id).pipe(
          map((exercise) => exerciseRefreshed({ exercise })),
          catchError((error) => of(refreshExerciseFailed({ id, error }))),
        ),
      ),
    ),
  );

  exerciseNavigationFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(exerciseNavigationFailed, refreshExerciseFailed),
        tap(({ error }) => {
          this.logger.error('[exercise] load failed:', error);
          this.message.error('Failed to Load Exercise');
        }),
      ),
    { dispatch: false },
  );

  checkForPendingChanges$ = createEffect(() =>
    interval(SAVE_INTERVAL_MS).pipe(
      withLatestFrom(
        this.store.select(selectExercisesWithPendingChanges),
        this.store.select(authFeature.selectUser),
      ),
      filter(([, pending, user]) => Boolean(user) && pending.length > 0),
      mergeMap(([, pending]) =>
        from(
          pending.map(({ id, pendingChanges }) =>
            savePendingChanges({ id, code: pendingChanges }),
          ),
        ),
      ),
    ),
  );

  savePendingChanges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(savePendingChanges),
      mergeMap(({ id, code }) =>
        this.exercise.saveCode(id, code).pipe(
          map(() => pendingChangesSaved({ id, code })),
          catchError((error) => of(savePendingChangesFailure({ id, error }))),
        ),
      ),
    ),
  );

  savePendingChangesFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(savePendingChangesFailure),
        tap(({ error }) => {
          this.logger.error('[exercise] save pending changes failed:', error);
          this.message.error('Failed to Save Changes');
        }),
      ),
    { dispatch: false },
  );

  attemptToSubmitExercise$ = createEffect(() =>
    this.actions$.pipe(
      ofType(attemptToSubmitExercise),
      withLatestFrom(this.store.select(authFeature.selectUser)),
      map(([{ code }, user]) =>
        user ? submitExercise({ code }) : AuthActions.openSignInModal(),
      ),
    ),
  );

  submitExercise$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitExercise),
      withLatestFrom(this.store.select(selectId)),
      switchMap(([{ code }, id]) =>
        this.exercise.submitExercise(id, code).pipe(
          map((exercise) => exerciseSubmitted({ exercise })),
          catchError((error) => of(submitExerciseFailed({ id, error }))),
        ),
      ),
    ),
  );

  displayPendingMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(submitExercise),
        tap(() => this.message.info('Running Tests...')),
      ),
    { dispatch: false },
  );

  exerciseSubmitted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(exerciseSubmitted),
        tap(({ exercise }) => {
          if (exercise.compilationError) {
            this.message.error('Compilation Error');
          } else {
            let passed = 0;
            let failed = 0;
            for (const test of exercise.tests) {
              if (test.status === 'passed') {
                ++passed;
              } else if (test.status === 'failed') {
                ++failed;
              }
            }

            if (failed) {
              this.message.error(`${failed}/${passed + failed} Tests Failed`);
            } else {
              this.message.success(`${passed}/${passed} Tests Passed`);
            }
          }
        }),
      ),
    { dispatch: false },
  );

  submitExerciseFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(submitExerciseFailed),
        tap(({ error }) => {
          this.logger.error('[exercise] submit failed:', error);

          this.message.error(submitErrorMessage(error));
        }),
      ),
    { dispatch: false },
  );
}

/**
 * A 429 carries the server's own explanation (per-user or site-wide limit),
 * so show that. Anything else gets a generic message.
 */
function submitErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 429) {
    const message = error.error?.message;
    if (typeof message === 'string' && message) {
      return message;
    }
    return 'Too many submissions. Please wait a moment and try again.';
  }
  return 'Failed to Submit Exercise';
}
