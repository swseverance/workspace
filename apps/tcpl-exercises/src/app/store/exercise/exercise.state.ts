import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Chapter, Exercise } from '../../../shared/models';

export type ExerciseEntity = Exercise & {
  pendingChanges: string;

  submitting: boolean;
};

export const exerciseEntityAdapter = createEntityAdapter<ExerciseEntity>();

export interface ExerciseState extends EntityState<ExerciseEntity> {
  id: string;

  chapters: Chapter[];

  chaptersLoading: boolean;
}

export const initialExerciseState: ExerciseState =
  exerciseEntityAdapter.getInitialState({
    id: '',
    chapters: [],
    chaptersLoading: false,
  });
