import { createReducer, on } from '@ngrx/store';
import { Chapter, Exercise, ExerciseStatus } from '../../../shared/models';
import {
  chaptersLoaded,
  loadChapters,
  loadChaptersFailed,
} from './chapters.actions';
import {
  applyHistoricalSubmission,
  codeEdited,
  draftRestored,
  exerciseNavigationSucceeded,
  exerciseRefreshed,
  exercisesReset,
  exerciseSubmitted,
  submitExercise,
  submitExerciseFailed,
} from './exercise.actions';
import {
  exerciseEntityAdapter,
  ExerciseState,
  initialExerciseState,
} from './exercise.state';

/**
 * The server's code replaces the editor's here; restoreDraft$ then puts back
 * any newer unsubmitted code, which DraftStore has saved on every edit.
 */
function upsertLoadedExercise(state: ExerciseState, exercise: Exercise) {
  return exerciseEntityAdapter.upsertOne(
    {
      ...exercise,
      submitting: state.entities[exercise.id]?.submitting ?? false,
    },
    state,
  );
}

function updateExerciseStatus(
  chapters: Chapter[],
  exerciseId: string,
  status: ExerciseStatus,
): Chapter[] {
  return chapters.map((chapter) => {
    const index = chapter.exercises.findIndex(
      (exercise) => exercise.id === exerciseId,
    );

    if (index === -1) {
      return chapter;
    }

    const exercises = [...chapter.exercises];
    exercises[index] = { ...exercises[index], status };

    return { ...chapter, exercises };
  });
}

export const exerciseReducer = createReducer(
  initialExerciseState,

  on(exercisesReset, () => initialExerciseState),

  // `code` follows the editor, so that applying a submission always changes
  // it, even back to code the user has since typed over.
  on(codeEdited, (state, { code }) =>
    exerciseEntityAdapter.updateOne({ id: state.id, changes: { code } }, state),
  ),

  on(applyHistoricalSubmission, (state, { submission: { code } }) =>
    exerciseEntityAdapter.updateOne({ id: state.id, changes: { code } }, state),
  ),

  on(draftRestored, (state, { id, code }) =>
    exerciseEntityAdapter.updateOne({ id, changes: { code } }, state),
  ),

  on(submitExercise, (state) => ({
    ...exerciseEntityAdapter.updateOne(
      { id: state.id, changes: { submitting: true } },
      state,
    ),
    chapters: updateExerciseStatus(state.chapters, state.id, 'pending'),
  })),

  on(exerciseSubmitted, (state, { exercise }) => {
    const entity = state.entities[exercise.id];
    const chapters = updateExerciseStatus(
      state.chapters,
      exercise.id,
      exercise.status,
    );

    if (!entity) {
      return { ...state, chapters };
    }

    // Keeps the editor's code, which may have changed while grading ran.
    const { code: _submittedCode, ...rest } = exercise;

    return exerciseEntityAdapter.updateOne(
      { id: exercise.id, changes: { ...rest, submitting: false } },
      { ...state, chapters },
    );
  }),

  on(submitExerciseFailed, (state, { id }) => ({
    ...exerciseEntityAdapter.updateOne(
      { id, changes: { submitting: false } },
      state,
    ),
    // Nothing was graded (e.g. rate limited), so put back the last known
    // status rather than losing a previous pass.
    chapters: updateExerciseStatus(
      state.chapters,
      id,
      state.entities[id]?.status ?? 'indeterminate',
    ),
  })),

  on(loadChapters, (state) => ({
    ...state,
    chaptersLoading: true,
  })),

  on(chaptersLoaded, (state, { chapters }) => ({
    ...state,
    chapters,
    chaptersLoading: false,
  })),

  on(loadChaptersFailed, (state) => ({
    ...state,
    chaptersLoading: false,
  })),

  // Not a navigation, so the shown exercise doesn't change.
  on(exerciseRefreshed, (state, { exercise }) =>
    upsertLoadedExercise(state, exercise),
  ),

  // The resolver only lets a navigation finish once its exercise has
  // loaded, so this is also where the shown exercise changes.
  on(exerciseNavigationSucceeded, (state, { exercise }) => ({
    ...upsertLoadedExercise(state, exercise),
    id: exercise.id,
  })),
);
