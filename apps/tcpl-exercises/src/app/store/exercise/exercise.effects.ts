import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthActions } from '@org/auth';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  of,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ExerciseService } from '../../services/exercise-service';
import {
  codeFormatted,
  exerciseNavigationFailed,
  exerciseRefreshed,
  exercisesReset,
  exerciseSubmitted,
  formatCode,
  formatCodeFailed,
  refreshExerciseFailed,
  submitExercise,
  submitExerciseFailed,
} from './exercise.actions';
import { selectId } from './exercise.selectors';

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
   * doesn't see it. Navigating first keeps the pages from rendering empty;
   * coming back refetches.
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
   * A session starting means the shown exercise was fetched signed out,
   * without the user's code and results, so fetch it again.
   */
  refreshExercise$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sessionStarted),
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

  /** exhaustMap: a second click while one is in flight does nothing. */
  formatCode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(formatCode),
      withLatestFrom(this.store.select(selectId)),
      exhaustMap(([{ code }, id]) =>
        this.exercise.formatCode(code).pipe(
          map((formatted) => codeFormatted({ id, code: formatted.code })),
          catchError((error) => of(formatCodeFailed({ id, error }))),
        ),
      ),
    ),
  );

  formatCodeFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(formatCodeFailed),
        tap(({ error }) => {
          this.logger.error('[exercise] format failed:', error);

          this.message.error(
            rateLimitMessage(error) ?? 'Failed to Format Code',
          );
        }),
      ),
    { dispatch: false },
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
        tap(() => this.message.info('Running Tests...', { nzDuration: 0 })),
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

          this.message.error(
            rateLimitMessage(error) ?? 'Failed to Submit Exercise',
          );
        }),
      ),
    { dispatch: false },
  );
}

/**
 * A 429 carries the server's own explanation (which limit was hit), so show
 * that. Null for any other error.
 */
function rateLimitMessage(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse) || error.status !== 429) {
    return null;
  }

  const message = error.error?.message;

  return typeof message === 'string' && message
    ? message
    : 'Too many requests. Please wait a moment and try again.';
}
