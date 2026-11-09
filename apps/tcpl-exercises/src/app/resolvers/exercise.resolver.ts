import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, map } from 'rxjs';
import { ExerciseService } from '../services/exercise-service';
import {
  exerciseNavigationFailed,
  exerciseNavigationStarted,
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

  // Always fetched fresh, even when revisiting: the reducer keeps any
  // unsaved pendingChanges and the submitting flag across the reload.
  store.dispatch(exerciseNavigationStarted({ id }));

  return exercises.getExercise(id).pipe(
    map((exercise) => {
      store.dispatch(exerciseNavigationSucceeded({ exercise }));
      return true;
    }),
    catchError((error: unknown) => {
      store.dispatch(exerciseNavigationFailed({ id, error }));

      // Completing without emitting cancels the navigation, keeping the
      // user on the previous exercise.
      return EMPTY;
    }),
  );
};
