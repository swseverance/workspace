import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthActions } from '@org/auth';
import { firstValueFrom, of, toArray } from 'rxjs';
import type { Exercise, ExerciseSubmission } from '../../../shared/models';
import { Draft, DraftStore } from '../../services/draft-store';
import { DraftEffects } from './draft.effects';
import {
  applyHistoricalSubmission,
  codeEdited,
  draftRestored,
  exerciseNavigationSucceeded,
  exerciseRefreshed,
  exerciseSubmitted,
} from './exercise.actions';
import { initialExerciseState } from './exercise.state';

const SUBMISSION: ExerciseSubmission = {
  id: 's1',
  created: '2026-11-12T10:00:00.000Z',
  status: 'failed',
  passed: 0,
  total: 1,
  code: 'submitted',
};

function exercise(changes: Partial<Exercise> = {}): Exercise {
  return {
    id: '1-1',
    code: 'saved',
    submissions: [],
    ...changes,
  } as Exercise;
}

describe('DraftEffects', () => {
  let stored: Draft | null;
  const drafts = {
    get: vi.fn(() => stored),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  };

  function setup(action: Action, id = '1-1') {
    TestBed.configureTestingModule({
      providers: [
        DraftEffects,
        // State, not overrideSelector: an overridden selector stays
        // overridden for later spec files in the same worker.
        provideMockStore({
          initialState: { exercise: { ...initialExerciseState, id } },
        }),
        provideMockActions(() => of(action)),
        { provide: DraftStore, useValue: drafts },
      ],
    });
    return TestBed.inject(DraftEffects);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    stored = null;
  });

  describe('saveDraft$', () => {
    it('saves each edit for the shown exercise', async () => {
      await firstValueFrom(setup(codeEdited({ code: 'typed' })).saveDraft$);

      expect(drafts.set).toHaveBeenCalledWith('1-1', 'typed');
    });

    it("saves a restored submission's code", async () => {
      await firstValueFrom(
        setup(applyHistoricalSubmission({ submission: SUBMISSION })).saveDraft$,
      );

      expect(drafts.set).toHaveBeenCalledWith('1-1', 'submitted');
    });
  });

  describe('restoreDraft$', () => {
    async function restored(action: Action) {
      return firstValueFrom(setup(action).restoreDraft$.pipe(toArray()));
    }

    it.each([
      ['navigating to', exerciseNavigationSucceeded],
      ['refreshing', exerciseRefreshed],
    ])('puts back a draft after %s an exercise', async (_name, loaded) => {
      stored = { code: 'draft', savedAt: '2026-11-12T10:00:00.000Z' };

      expect(await restored(loaded({ exercise: exercise() }))).toEqual([
        draftRestored({ id: '1-1', code: 'draft' }),
      ]);
    });

    it('puts back a draft typed after the latest submission', async () => {
      stored = { code: 'draft', savedAt: '2026-11-12T10:00:01.000Z' };

      expect(
        await restored(
          exerciseNavigationSucceeded({
            exercise: exercise({ submissions: [SUBMISSION] }),
          }),
        ),
      ).toEqual([draftRestored({ id: '1-1', code: 'draft' })]);
      expect(drafts.delete).not.toHaveBeenCalled();
    });

    it('deletes a draft older than the latest submission', async () => {
      stored = { code: 'draft', savedAt: '2026-11-12T09:59:59.000Z' };

      expect(
        await restored(
          exerciseNavigationSucceeded({
            exercise: exercise({ submissions: [SUBMISSION] }),
          }),
        ),
      ).toEqual([]);
      expect(drafts.delete).toHaveBeenCalledWith('1-1');
    });

    it('does nothing without a draft, or when it matches the saved code', async () => {
      expect(
        await restored(exerciseNavigationSucceeded({ exercise: exercise() })),
      ).toEqual([]);

      TestBed.resetTestingModule();
      stored = { code: 'saved', savedAt: '2026-11-12T10:00:00.000Z' };

      expect(
        await restored(exerciseNavigationSucceeded({ exercise: exercise() })),
      ).toEqual([]);
    });
  });

  describe('deleteSubmittedDraft$', () => {
    it('deletes the draft when it is what was submitted', async () => {
      stored = { code: 'saved', savedAt: '2026-11-12T10:00:00.000Z' };

      await firstValueFrom(
        setup(exerciseSubmitted({ exercise: exercise() }))
          .deleteSubmittedDraft$,
      );

      expect(drafts.delete).toHaveBeenCalledWith('1-1');
    });

    it('keeps a draft typed while grading ran', async () => {
      stored = { code: 'typed since', savedAt: '2026-11-12T10:00:00.000Z' };

      await firstValueFrom(
        setup(
          exerciseSubmitted({ exercise: exercise() }),
        ).deleteSubmittedDraft$.pipe(toArray()),
      );

      expect(drafts.delete).not.toHaveBeenCalled();
    });
  });

  describe('clearDrafts$', () => {
    it('clears drafts when a session ends', async () => {
      await firstValueFrom(
        setup(AuthActions.sessionEnded({ user: { uid: 'a' } })).clearDrafts$,
      );

      expect(drafts.clear).toHaveBeenCalled();
    });
  });
});
