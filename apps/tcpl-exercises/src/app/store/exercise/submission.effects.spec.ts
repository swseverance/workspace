import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import type { ModalOptions } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { ExerciseSubmission } from '../../../shared/models';
import {
  applyHistoricalSubmission,
  closeApplySubmissionModal,
  openApplySubmissionModal,
} from './exercise.actions';
import { SubmissionEffects } from './submission.effects';

const SUBMISSION: ExerciseSubmission = {
  id: 's1',
  created: '2026-11-09T18:30:00.000Z',
  status: 'passed',
  passed: 1,
  total: 1,
  code: 'int main() { return 0; }\n',
};

describe('SubmissionEffects', () => {
  let actions$: Observable<Action>;
  const modal = { confirm: vi.fn() };

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        SubmissionEffects,
        provideMockActions(() => actions$),
        { provide: NzModalService, useValue: modal },
      ],
    });
    return TestBed.inject(SubmissionEffects);
  }

  /** The options passed to the nth modal.confirm call. */
  function confirmOptions(call = 0): ModalOptions {
    return modal.confirm.mock.calls[call][0];
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openApplySubmissionModal$', () => {
    it('asks for confirmation', () => {
      actions$ = of(openApplySubmissionModal({ submission: SUBMISSION }));
      setup().openApplySubmissionModal$.subscribe();

      expect(modal.confirm).toHaveBeenCalledOnce();
      expect(confirmOptions()).toMatchObject({
        nzTitle: 'Restore this submission?',
        nzOkText: 'Restore',
        nzCancelText: 'Cancel',
      });
    });

    it('applies the submission on OK', async () => {
      actions$ = of(openApplySubmissionModal({ submission: SUBMISSION }));
      const action = firstValueFrom(setup().openApplySubmissionModal$);

      (confirmOptions().nzOnOk as () => void)();

      expect(await action).toEqual(
        applyHistoricalSubmission({ submission: SUBMISSION }),
      );
    });

    it('reports a close on Cancel', async () => {
      actions$ = of(openApplySubmissionModal({ submission: SUBMISSION }));
      const action = firstValueFrom(setup().openApplySubmissionModal$);

      (confirmOptions().nzOnCancel as () => void)();

      expect(await action).toEqual(closeApplySubmissionModal());
    });

    it('ignores further opens while a modal is open', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      setup().openApplySubmissionModal$.subscribe();

      actions.next(openApplySubmissionModal({ submission: SUBMISSION }));
      actions.next(openApplySubmissionModal({ submission: SUBMISSION }));

      expect(modal.confirm).toHaveBeenCalledOnce();
    });

    it('opens again once the previous modal is closed', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      setup().openApplySubmissionModal$.subscribe();

      actions.next(openApplySubmissionModal({ submission: SUBMISSION }));
      (confirmOptions(0).nzOnCancel as () => void)();
      actions.next(openApplySubmissionModal({ submission: SUBMISSION }));

      expect(modal.confirm).toHaveBeenCalledTimes(2);
    });
  });
});
