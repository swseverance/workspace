import { createAction, props } from '@ngrx/store';
import { Exercise } from '../../../shared/models';

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

export const exerciseNavigationSucceeded = createAction(
  'Exercise Navigation Succeeded',
  props<{ exercise: Exercise }>(),
);

export const exerciseNavigationFailed = createAction(
  'Exercise Navigation Failed',
  props<{ id: string; error: unknown }>(),
);

/**
 * The signed-in user went away (signed out here or in another tab). Drops
 * their code, unsaved edits and results.
 */
export const exercisesReset = createAction('Exercises Reset');
