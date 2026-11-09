import { HttpErrorResponse } from '@angular/common/http';
import { Chapter, Exercise } from '../../../shared/models';
import {
  codeEdited,
  exerciseNavigationFailed,
  exerciseNavigationStarted,
  exerciseNavigationSucceeded,
  exerciseSubmitted,
  pendingChangesSaved,
  savePendingChangesFailure,
  selectExercise,
  submitExercise,
  submitExerciseFailed,
} from './exercise.actions';
import { exerciseReducer } from './exercise.reducer';
import {
  ExerciseEntity,
  exerciseEntityAdapter,
  ExerciseState,
  initialExerciseState,
} from './exercise.state';

const EXERCISE: Exercise = {
  id: '1-1',
  chapter: 1,
  number: 1,
  description: 'Print "hello, world"',
  code: '#include <stdio.h>\n',
  solution:
    '#include <stdio.h>\n\nint main() {\n  printf("hello, world\\n");\n}\n',
  tests: [
    {
      id: 'a',
      stdin: '',
      expectedStdout: 'hello, world\n',
      actualStdout: '',
      status: 'indeterminate',
    },
  ],
  status: 'indeterminate',
  compilationError: '',
};

const ENTITY: ExerciseEntity = {
  ...EXERCISE,
  pendingChanges: '',
  loading: false,
  submitting: false,
};

const CHAPTERS: Chapter[] = [
  {
    number: 1,
    exercises: [
      { id: '1-1', chapter: 1, number: 1, status: 'indeterminate' },
      { id: '1-2', chapter: 1, number: 2, status: 'passed' },
    ],
  },
];

function withEntities(...entities: ExerciseEntity[]): ExerciseState {
  return exerciseEntityAdapter.setAll(entities, initialExerciseState);
}

describe('exerciseReducer', () => {
  describe('selectExercise', () => {
    it('sets the id, leaving everything else unchanged', () => {
      const state = exerciseReducer(
        initialExerciseState,
        selectExercise({ id: '1-1' }),
      );

      expect(state).toEqual({ ...initialExerciseState, id: '1-1' });
    });
  });

  describe('exerciseNavigationStarted', () => {
    it('sets nextId without creating a placeholder entity when none exists', () => {
      const state = exerciseReducer(
        initialExerciseState,
        exerciseNavigationStarted({ id: '1-1' }),
      );

      expect(state.nextId).toBe('1-1');
      expect(state.entities['1-1']).toBeUndefined();
    });

    it('marks an existing entity as loading, leaving its other fields unchanged', () => {
      const previousState = withEntities(ENTITY);

      const state = exerciseReducer(
        previousState,
        exerciseNavigationStarted({ id: '1-1' }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, loading: true });
      expect(state.nextId).toBe('1-1');
    });
  });

  describe('exerciseNavigationSucceeded', () => {
    it('adds the loaded exercise and clears nextId', () => {
      const previousState = { ...initialExerciseState, nextId: '1-1' };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.entities['1-1']).toEqual(ENTITY);
      expect(state.nextId).toBeNull();
    });

    it('clears loading on an existing entity', () => {
      const previousState = {
        ...withEntities({ ...ENTITY, loading: true }),
        nextId: '1-1',
      };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, loading: false });
    });

    it('folds an existing pending change into code, so an unsaved edit survives navigating away and back', () => {
      const previousState = {
        ...withEntities({
          ...ENTITY,
          loading: true,
          pendingChanges: 'unsaved edit',
        }),
        id: '1-1',
      };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.entities['1-1']).toEqual({
        ...ENTITY,
        code: 'unsaved edit',
        loading: false,
        pendingChanges: 'unsaved edit',
      });
    });

    it('leaves nextId alone when navigation has since moved on to a different exercise', () => {
      const previousState = { ...initialExerciseState, nextId: '2-1' };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.nextId).toBe('2-1');
    });
  });

  describe('exerciseNavigationFailed', () => {
    it('clears loading and nextId for the failed exercise', () => {
      const previousState = {
        ...withEntities({ ...ENTITY, loading: true }),
        nextId: '1-1',
      };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationFailed({ id: '1-1', error: 'boom' }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, loading: false });
      expect(state.nextId).toBeNull();
    });

    it('leaves no entity behind when the exercise was never loaded, so revisiting refetches it', () => {
      const previousState = { ...initialExerciseState, nextId: '1-1' };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationFailed({ id: '1-1', error: 'boom' }),
      );

      expect(state.entities['1-1']).toBeUndefined();
      expect(state.nextId).toBeNull();
    });

    it('only clears loading for the exercise that failed, leaving a different exercise untouched', () => {
      const previousState = {
        ...withEntities(
          { ...ENTITY, loading: true },
          { ...ENTITY, id: '2-1', loading: true },
        ),
        id: '2-1',
      };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationFailed({ id: '1-1', error: 'boom' }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, loading: false });
      expect(state.entities['2-1']).toEqual({
        ...ENTITY,
        id: '2-1',
        loading: true,
      });
    });
  });

  describe('codeEdited', () => {
    it('sets pendingChanges for the selected exercise, leaving other entities untouched', () => {
      const previousState = {
        ...withEntities(ENTITY, { ...ENTITY, id: '2-1' }),
        id: '1-1',
      };

      const state = exerciseReducer(
        previousState,
        codeEdited({ code: 'new code' }),
      );

      expect(state.entities['1-1']).toEqual({
        ...ENTITY,
        pendingChanges: 'new code',
      });
      expect(state.entities['2-1']).toEqual({ ...ENTITY, id: '2-1' });
    });
  });

  describe('pendingChangesSaved', () => {
    it('does nothing when there is no pending change for the given id', () => {
      const previousState = withEntities({ ...ENTITY, id: '2-1' });

      const state = exerciseReducer(
        previousState,
        pendingChangesSaved({ id: '1-1', code: 'some code' }),
      );

      expect(state).toBe(previousState);
    });

    it('clears pendingChanges when it still matches what was last typed, leaving code untouched so the live editor is never overwritten', () => {
      const previousState = withEntities({
        ...ENTITY,
        pendingChanges: 'some code',
      });

      const state = exerciseReducer(
        previousState,
        pendingChangesSaved({ id: '1-1', code: 'some code' }),
      );

      expect(state.entities['1-1']).toEqual({
        ...ENTITY,
        pendingChanges: '',
      });
    });

    it('leaves the newer pending code in place when the user has typed more since the save was dispatched', () => {
      const previousState = withEntities({
        ...ENTITY,
        pendingChanges: 'newer code',
      });

      const state = exerciseReducer(
        previousState,
        pendingChangesSaved({ id: '1-1', code: 'older code' }),
      );

      expect(state).toBe(previousState);
    });
  });

  describe('savePendingChangesFailure', () => {
    it('does nothing when there is no pending change for the given id', () => {
      const previousState = withEntities({ ...ENTITY, id: '2-1' });

      const state = exerciseReducer(
        previousState,
        savePendingChangesFailure({
          id: '1-1',
          error: new HttpErrorResponse({ status: 400 }),
        }),
      );

      expect(state).toBe(previousState);
    });

    it('drops the pending change entirely when the backend rejects the code as invalid (400)', () => {
      const previousState = withEntities({
        ...ENTITY,
        pendingChanges: 'some code',
      });

      const state = exerciseReducer(
        previousState,
        savePendingChangesFailure({
          id: '1-1',
          error: new HttpErrorResponse({ status: 400 }),
        }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, pendingChanges: '' });
    });

    it('keeps the pending change on any other error, so it gets retried', () => {
      const previousState = withEntities({
        ...ENTITY,
        pendingChanges: 'some code',
      });

      const state = exerciseReducer(
        previousState,
        savePendingChangesFailure({
          id: '1-1',
          error: new HttpErrorResponse({ status: 500 }),
        }),
      );

      expect(state).toBe(previousState);
    });
  });

  describe('submitExercise', () => {
    it('sets submitting to true for the selected exercise, leaving everything else unchanged', () => {
      const previousState = { ...withEntities(ENTITY), id: '1-1' };

      const state = exerciseReducer(
        previousState,
        submitExercise({ code: 'submitted code' }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, submitting: true });
    });

    it('sets the sidebar status of the exercise being submitted to pending, leaving other exercises untouched', () => {
      const previousState = {
        ...withEntities(ENTITY),
        id: '1-1',
        chapters: CHAPTERS,
      };

      const state = exerciseReducer(
        previousState,
        submitExercise({ code: 'submitted code' }),
      );

      expect(state.chapters).toEqual([
        {
          number: 1,
          exercises: [
            { id: '1-1', chapter: 1, number: 1, status: 'pending' },
            { id: '1-2', chapter: 1, number: 2, status: 'passed' },
          ],
        },
      ]);
    });
  });

  describe('exerciseSubmitted', () => {
    it('keeps the current exercise code instead of the submitted one, so a live edit made while the submission was in flight is never clobbered, and removes a pending change that matches what was submitted', () => {
      const submittedExercise: Exercise = {
        ...EXERCISE,
        code: 'submitted code',
        status: 'passed',
        tests: [{ ...EXERCISE.tests[0], status: 'passed' }],
      };

      const previousState = withEntities({
        ...ENTITY,
        code: 'typed after submit',
        pendingChanges: 'submitted code',
        submitting: true,
      });

      const state = exerciseReducer(
        previousState,
        exerciseSubmitted({ exercise: submittedExercise }),
      );

      expect(state.entities['1-1']).toEqual({
        ...submittedExercise,
        code: 'typed after submit',
        pendingChanges: '',
        loading: false,
        submitting: false,
      });
    });

    it('leaves the pending change in place when it no longer matches what was submitted', () => {
      const submittedExercise: Exercise = {
        ...EXERCISE,
        code: 'submitted code',
      };

      const previousState = withEntities({
        ...ENTITY,
        code: 'typed after submit',
        pendingChanges: 'even newer code',
        submitting: true,
      });

      const state = exerciseReducer(
        previousState,
        exerciseSubmitted({ exercise: submittedExercise }),
      );

      expect(state.entities['1-1']).toEqual({
        ...submittedExercise,
        code: 'typed after submit',
        pendingChanges: 'even newer code',
        loading: false,
        submitting: false,
      });
    });

    it('updates the sidebar status of the submitted exercise to match the result, leaving other exercises untouched', () => {
      const submittedExercise: Exercise = { ...EXERCISE, status: 'failed' };

      const previousState = {
        ...withEntities({ ...ENTITY, submitting: true }),
        chapters: [
          {
            number: 1,
            exercises: [
              { id: '1-1', chapter: 1, number: 1, status: 'pending' },
              { id: '1-2', chapter: 1, number: 2, status: 'passed' },
            ],
          },
        ] as Chapter[],
      };

      const state = exerciseReducer(
        previousState,
        exerciseSubmitted({ exercise: submittedExercise }),
      );

      expect(state.chapters).toEqual(
        CHAPTERS.map((chapter) => ({
          ...chapter,
          exercises: chapter.exercises.map((exercise) =>
            exercise.id === '1-1'
              ? { ...exercise, status: 'failed' }
              : exercise,
          ),
        })),
      );
    });
  });

  describe('submitExerciseFailed', () => {
    it('clears submitting for the submitted exercise, leaving everything else unchanged', () => {
      const previousState = withEntities({ ...ENTITY, submitting: true });

      const state = exerciseReducer(
        previousState,
        submitExerciseFailed({ id: '1-1', error: 'boom' }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, submitting: false });
    });

    it('only clears submitting for the exercise that failed, leaving a different, currently-selected exercise untouched', () => {
      const previousState = {
        ...withEntities(
          { ...ENTITY, submitting: true },
          { ...ENTITY, id: '2-1', submitting: true },
        ),
        id: '2-1',
      };

      const state = exerciseReducer(
        previousState,
        submitExerciseFailed({ id: '1-1', error: 'boom' }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, submitting: false });
      expect(state.entities['2-1']).toEqual({
        ...ENTITY,
        id: '2-1',
        submitting: true,
      });
    });

    it('sets the sidebar status of the exercise being submitted back to indeterminate, leaving other exercises untouched', () => {
      const previousState = {
        ...withEntities({ ...ENTITY, submitting: true }),
        chapters: [
          {
            number: 1,
            exercises: [
              { id: '1-1', chapter: 1, number: 1, status: 'pending' },
              { id: '1-2', chapter: 1, number: 2, status: 'passed' },
            ],
          },
        ] as Chapter[],
      };

      const state = exerciseReducer(
        previousState,
        submitExerciseFailed({ id: '1-1', error: 'boom' }),
      );

      expect(state.chapters).toEqual(CHAPTERS);
    });
  });
});
