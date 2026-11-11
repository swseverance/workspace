import { createAction, props } from '@ngrx/store';
import { Exercise, ExerciseSubmission } from '../../../shared/models';

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

/** The shown exercise, fetched again now that the user is signed in. */
export const exerciseRefreshed = createAction(
  'Exercise Refreshed',
  props<{ exercise: Exercise }>(),
);

export const refreshExerciseFailed = createAction(
  'Refresh Exercise Failed',
  props<{ id: string; error: unknown }>(),
);

/** Asks the user to confirm replacing their code with a submission's. */
export const openApplySubmissionModal = createAction(
  'Open Apply Submission Modal',
  props<{ submission: ExerciseSubmission }>(),
);

export const closeApplySubmissionModal = createAction(
  'Close Apply Submission Modal',
);

/** Replaces the editor's code with an earlier submission's. */
export const applyHistoricalSubmission = createAction(
  'Apply Historical Submission',
  props<{ submission: ExerciseSubmission }>(),
);

/**
 * The signed-in user went away (signed out here or in another tab). Drops
 * their code, unsaved edits and results.
 */
export const exercisesReset = createAction('Exercises Reset');
