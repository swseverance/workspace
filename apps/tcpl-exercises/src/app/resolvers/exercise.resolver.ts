import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
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
 */
export const exerciseResolver: ResolveFn<boolean> = (route) => {
  const id = route.paramMap.get('id')!;
  const store = inject(Store);
  const exercises = inject(ExerciseService);
  const router = inject(Router);
  const cookieCreated$ = inject(Actions).pipe(
    ofType(AuthActions.cookieCreated),
  );

  // Always fetched fresh, even when revisiting: the reducer keeps any
  // unsaved pendingChanges and the submitting flag across the reload.
  //
  // A sign-in finishing mid-request makes the response stale (signed out, so
  // no saved code, which autosave would then write over), so start the
  // request again, as loadChapters$ does. refreshExercise$ can't cover this:
  // it refetches the exercise in the store, which is still the previous one.
  return cookieCreated$.pipe(
    startWith(null),
    switchMap(() => exercises.getExercise(id)),
    take(1),
    map((exercise) => {
      store.dispatch(exerciseNavigationSucceeded({ exercise }));
      return true;
    }),
    catchError((error: unknown) => {
      store.dispatch(exerciseNavigationFailed({ id, error }));

      // No such exercise (a typo, old bookmark or removed exercise): go to
      // the default one rather than leave an empty pane on a first load.
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return of(new RedirectCommand(router.parseUrl('/exercises')));
      }

      // Any other failure: completing without emitting cancels the navigation, keeping the
      // user on the previous exercise.
      return EMPTY;
    }),
  );
};
