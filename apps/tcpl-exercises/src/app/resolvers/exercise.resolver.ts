import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthActions } from '@org/auth';
import { catchError, EMPTY, map, of, startWith, switchMap, take } from 'rxjs';
import { ExerciseService } from '../services/exercise-service';
import {
  exerciseNavigationFailed,
  exerciseNavigationSucceeded,
} from '../store/exercise/exercise.actions';

/**
 * Blocks activating the :id route until the exercise has loaded. Runs on
 * the initial navigation too, so SSR renders with the exercise loaded and
 * hydration finds the same response in the transfer cache.
 *
 * Resolves false when there's no such exercise (a typo, old bookmark or
 * removed exercise), so the page shows the 404 page at the same URL.
 */
export const exerciseResolver: ResolveFn<boolean> = (route) => {
  const id = route.paramMap.get('id')!;
  const store = inject(Store);
  const exercises = inject(ExerciseService);
  const sessionStarted$ = inject(Actions).pipe(
    ofType(AuthActions.sessionStarted),
  );

  // Always fetched fresh, even when revisiting: the reducer keeps the
  // submitting flag across the reload, and restoreDraft$ puts back any
  // unsubmitted code.
  //
  // A sign-in finishing mid-request makes the response stale (signed out, so
  // without the user's submitted code and results), so start the request
  // again, as loadChapters$ does. refreshExercise$ can't cover this:
  // it refetches the exercise in the store, which is still the previous one.
  return sessionStarted$.pipe(
    startWith(null),
    switchMap(() => exercises.getExercise(id)),
    take(1),
    map((exercise) => {
      store.dispatch(exerciseNavigationSucceeded({ exercise }));
      return true;
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return of(false);
      }

      store.dispatch(exerciseNavigationFailed({ id, error }));

      // Any other failure: completing without emitting cancels the navigation, keeping the
      // user on the previous exercise.
      return EMPTY;
    }),
  );
};
