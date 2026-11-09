import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  DEFAULT_EXERCISE,
  ExerciseEntity,
  exerciseEntityAdapter,
  ExerciseState,
} from './exercise.state';

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

export const selectExercise = createSelector(
  selectCurrentEntity,
  (entity) => entity ?? DEFAULT_EXERCISE,
);

export const selectExerciseLoading = createSelector(
  selectCurrentEntity,
  (entity) => entity?.loading ?? false,
);

export const selectSubmissionPending = createSelector(
  selectCurrentEntity,
  (entity) => entity?.submitting ?? false,
);

export const selectExercisesWithPendingChanges = createSelector(
  selectEntities,
  (entities) =>
    Object.values(entities).filter(
      (entity): entity is ExerciseEntity =>
        entity !== undefined && entity.pendingChanges !== '',
    ),
);

export const selectNextId = createSelector(
  selectExerciseState,
  (state) => state.nextId,
);

export const selectNextExerciseLoading = createSelector(
  selectEntities,
  selectNextId,
  (entities, nextId) => (nextId ? (entities[nextId]?.loading ?? true) : false),
);

export const selectShowExerciseSkeleton = createSelector(
  selectExerciseLoading,
  selectNextExerciseLoading,
  (current, next) => current || next,
);
