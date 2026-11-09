import { createAction, props } from '@ngrx/store';
import { Exercise } from '../../../shared/models';

export const selectExercise = createAction(
  'Select Exercise',
  props<{ id: string }>(),
);

export const codeEdited = createAction(
  'Code Edited',
  props<{ code: string }>(),
);

export const savePendingChanges = createAction(
  'Save Pending Changes',
  props<{ id: string; code: string }>(),
);

export const pendingChangesSaved = createAction(
  'Pending Changes Saved',
  props<{ id: string; code: string }>(),
);

export const savePendingChangesFailure = createAction(
  'Save Pending Changes Failure',
  props<{ id: string; error: unknown }>(),
);

export const attemptToSubmitExercise = createAction(
  'Attempt To Submit Exercise',
  props<{ code: string }>(),
);

export const submitExercise = createAction(
  'Submit Exercise',
  props<{ code: string }>(),
);

export const exerciseSubmitted = createAction(
  'Exercise Submitted',
  props<{ exercise: Exercise }>(),
);

export const submitExerciseFailed = createAction(
  'Submit Exercise Failed',
  props<{ id: string; error: unknown }>(),
);

/**
 * Dispatched by exerciseResolver when it starts fetching an exercise, so
 * the UI can show a skeleton for the exercise being navigated to even while
 * the currently displayed one isn't itself loading. The resolver dispatches
 * one of the two outcomes below once the fetch settles.
 */
export const exerciseNavigationStarted = createAction(
  'Exercise Navigation Started',
  props<{ id: string }>(),
);

export const exerciseNavigationSucceeded = createAction(
  'Exercise Navigation Succeeded',
  props<{ exercise: Exercise }>(),
);

export const exerciseNavigationFailed = createAction(
  'Exercise Navigation Failed',
  props<{ id: string; error: unknown }>(),
);
