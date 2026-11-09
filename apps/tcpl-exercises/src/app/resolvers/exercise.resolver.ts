import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, map, of } from 'rxjs';
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

  // Always fetched fresh, even when revisiting: the reducer keeps any
  // unsaved pendingChanges and the submitting flag across the reload.
  return exercises.getExercise(id).pipe(
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
