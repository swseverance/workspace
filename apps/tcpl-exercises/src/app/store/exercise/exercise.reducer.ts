import { HttpErrorResponse } from '@angular/common/http';
import { createReducer, on } from '@ngrx/store';
import { Chapter, Exercise, ExerciseStatus } from '../../../shared/models';
import {
  chaptersLoaded,
  loadChapters,
  loadChaptersFailed,
} from './chapters.actions';
import {
  codeEdited,
  exerciseNavigationSucceeded,
  exercisesReset,
  exerciseSubmitted,
  pendingChangesSaved,
  savePendingChangesFailure,
  submitExercise,
  submitExerciseFailed,
} from './exercise.actions';
import {
  exerciseEntityAdapter,
  ExerciseState,
  initialExerciseState,
} from './exercise.state';

function upsertLoadedExercise(state: ExerciseState, exercise: Exercise) {
  const existing = state.entities[exercise.id];

  return exerciseEntityAdapter.upsertOne(
    existing
      ? {
          ...exercise,
          code: existing.pendingChanges || exercise.code,
          pendingChanges: existing.pendingChanges,
          submitting: existing.submitting,
        }
      : { ...exercise, pendingChanges: '', submitting: false },
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

  on(codeEdited, (state, { code }) =>
    exerciseEntityAdapter.updateOne(
      { id: state.id, changes: { pendingChanges: code } },
      state,
    ),
  ),

  on(pendingChangesSaved, (state, { id, code }) => {
    const entity = state.entities[id];

    if (!entity || entity.pendingChanges !== code) {
      return state;
    }

    return exerciseEntityAdapter.updateOne(
      { id, changes: { pendingChanges: '' } },
      state,
    );
  }),

  on(savePendingChangesFailure, (state, { id, error }) => {
    const entity = state.entities[id];

    if (
      !entity ||
      !(error instanceof HttpErrorResponse) ||
      error.status !== 400
    ) {
      return state;
    }

    return exerciseEntityAdapter.updateOne(
      { id, changes: { pendingChanges: '' } },
      state,
    );
  }),

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

    const { code: _submittedCode, ...rest } = exercise;

    return exerciseEntityAdapter.updateOne(
      {
        id: exercise.id,
        changes: {
          ...rest,
          pendingChanges:
            entity.pendingChanges === exercise.code
              ? ''
              : entity.pendingChanges,
          submitting: false,
        },
      },
      { ...state, chapters },
    );
  }),

  on(submitExerciseFailed, (state, { id }) => ({
    ...exerciseEntityAdapter.updateOne(
      { id, changes: { submitting: false } },
      state,
    ),
    chapters: updateExerciseStatus(state.chapters, id, 'indeterminate'),
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

  // The resolver only lets a navigation finish once its exercise has
  // loaded, so this is also where the shown exercise changes.
  on(exerciseNavigationSucceeded, (state, { exercise }) => ({
    ...upsertLoadedExercise(state, exercise),
    id: exercise.id,
  })),
);
