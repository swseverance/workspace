import { HttpErrorResponse } from '@angular/common/http';
import { Chapter, Exercise, ExerciseSubmission } from '../../../shared/models';
import {
  applyHistoricalSubmission,
  codeEdited,
  exerciseNavigationSucceeded,
  exerciseRefreshed,
  exercisesReset,
  exerciseSubmitted,
  pendingChangesSaved,
  savePendingChangesFailure,
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
  title: 'Hello, world',
  summary: 'Print "hello, world".',
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
      actualStderr: '',
      stopReason: null,
      exitCode: null,
      status: 'indeterminate',
    },
  ],
  status: 'indeterminate',
  compilationError: '',
  compilerWarnings: '',
  submissions: [],
};

const ENTITY: ExerciseEntity = {
  ...EXERCISE,
  pendingChanges: '',
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
  describe('exercisesReset', () => {
    it('goes back to the initial state, dropping code, edits and results', () => {
      const previousState = {
        ...withEntities({ ...ENTITY, pendingChanges: 'unsaved edit' }),
        id: '1-1',
        chapters: CHAPTERS,
      };

      const state = exerciseReducer(previousState, exercisesReset());

      expect(state).toEqual(initialExerciseState);
    });
  });

  describe('exerciseNavigationSucceeded', () => {
    it('adds the loaded exercise and makes it the current one', () => {
      const previousState = { ...initialExerciseState, id: '2-1' };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.entities['1-1']).toEqual(ENTITY);
      expect(state.id).toBe('1-1');
    });

    it('folds an existing pending change into code, so an unsaved edit survives navigating away and back', () => {
      const previousState = {
        ...withEntities({ ...ENTITY, pendingChanges: 'unsaved edit' }),
        id: '1-1',
      };

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.entities['1-1']).toEqual({
        ...ENTITY,
        code: 'unsaved edit',
        pendingChanges: 'unsaved edit',
      });
    });

    it('keeps the submitting flag of an existing entity', () => {
      const previousState = withEntities({ ...ENTITY, submitting: true });

      const state = exerciseReducer(
        previousState,
        exerciseNavigationSucceeded({ exercise: EXERCISE }),
      );

      expect(state.entities['1-1']?.submitting).toBe(true);
    });
  });

  describe('exerciseRefreshed', () => {
    it("replaces the exercise's data without changing which one is shown", () => {
      const previousState = { ...withEntities(ENTITY), id: '2-1' };
      const refreshed: Exercise = {
        ...EXERCISE,
        code: 'saved code',
        status: 'passed',
      };

      const state = exerciseReducer(
        previousState,
        exerciseRefreshed({ exercise: refreshed }),
      );

      expect(state.entities['1-1']).toEqual({ ...ENTITY, ...refreshed });
      expect(state.id).toBe('2-1');
    });
  });

  describe('codeEdited', () => {
    it('sets code and pendingChanges for the selected exercise, leaving other entities untouched', () => {
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
        code: 'new code',
        pendingChanges: 'new code',
      });
      expect(state.entities['2-1']).toEqual({ ...ENTITY, id: '2-1' });
    });
  });

  describe('applyHistoricalSubmission', () => {
    const submission: ExerciseSubmission = {
      id: 's1',
      created: '2026-11-09T18:30:00.000Z',
      status: 'passed',
      passed: 1,
      total: 1,
      code: 'old code',
    };

    it("puts the submission's code in the editor and marks it to be saved", () => {
      const previousState = {
        ...withEntities(ENTITY, { ...ENTITY, id: '2-1' }),
        id: '1-1',
      };

      const state = exerciseReducer(
        previousState,
        applyHistoricalSubmission({ submission }),
      );

      expect(state.entities['1-1']).toEqual({
        ...ENTITY,
        code: 'old code',
        pendingChanges: 'old code',
      });
      expect(state.entities['2-1']).toEqual({ ...ENTITY, id: '2-1' });
    });

    it('changes code even after the user typed over the same submission', () => {
      let state = exerciseReducer(
        { ...withEntities(ENTITY), id: '1-1' },
        applyHistoricalSubmission({ submission }),
      );
      state = exerciseReducer(state, codeEdited({ code: 'typed over' }));
      state = exerciseReducer(state, applyHistoricalSubmission({ submission }));

      expect(state.entities['1-1']?.code).toBe('old code');
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
