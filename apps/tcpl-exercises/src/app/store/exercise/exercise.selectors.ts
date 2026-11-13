import { createFeatureSelector, createSelector } from '@ngrx/store';
import { exerciseEntityAdapter, ExerciseState } from './exercise.state';

export const selectExerciseState =
  createFeatureSelector<ExerciseState>('exercise');

export const selectId = createSelector(
  selectExerciseState,
  (state) => state.id,
);

export const selectChapters = createSelector(
  selectExerciseState,
  (state) => state.chapters,
);

export const selectChaptersLoading = createSelector(
  selectExerciseState,
  (state) => state.chaptersLoading,
);

export const { selectEntities } =
  exerciseEntityAdapter.getSelectors(selectExerciseState);

export const selectCurrentEntity = createSelector(
  selectEntities,
  selectId,
  (entities, id) => entities[id],
);

export const selectSubmissionPending = createSelector(
  selectCurrentEntity,
  (entity) => entity?.submitting ?? false,
);
