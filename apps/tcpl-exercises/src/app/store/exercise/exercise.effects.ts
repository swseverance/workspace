import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthActions, authFeature } from '@org/auth';
import { Logger } from '@org/logger';
import { NzMessageRef, NzMessageService } from 'ng-zorro-antd/message';
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
  exerciseSubmitted,
  pendingChangesSaved,
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
  private messageRef: NzMessageRef | null = null;

  exerciseNavigationFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(exerciseNavigationFailed),
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
        tap(
          () =>
            (this.messageRef = this.message.info('Running Tests...', {
              nzDuration: 0,
            })),
        ),
      ),
    { dispatch: false },
  );

  exerciseSubmitted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(exerciseSubmitted),
        tap(({ exercise }) => {
          if (this.messageRef) {
            this.message.remove(this.messageRef.messageId);
            this.messageRef = null;
          }

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
          // TODO - CHECK IF USER WAS RATE LIMITED
          this.message.error('Failed to Submit Exercise');
        }),
      ),
    { dispatch: false },
  );
}
