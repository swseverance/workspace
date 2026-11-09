import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import type { ModalOptions } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { ExerciseSubmission } from '../../../shared/models';
import { SubmissionCode } from '../../components/submission-code/submission-code';
import {
  applyHistoricalSubmission,
  closeSubmissionModal,
  openSubmissionModal,
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
  const modal = { create: vi.fn() };

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

  /** The options passed to the nth modal.create call. */
  function createOptions(call = 0): ModalOptions {
    return modal.create.mock.calls[call][0];
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openSubmissionModal$', () => {
    it("opens a modal showing the submission's code", () => {
      actions$ = of(openSubmissionModal({ submission: SUBMISSION }));
      setup().openSubmissionModal$.subscribe();

      expect(modal.create).toHaveBeenCalledOnce();
      expect(createOptions()).toMatchObject({
        nzContent: SubmissionCode,
        nzData: { submission: SUBMISSION },
        nzOkText: 'Apply',
        nzCancelText: 'Close',
      });
      expect(createOptions().nzTitle).toMatch(/^Submission from /);
    });

    it('applies the submission on Apply', async () => {
      actions$ = of(openSubmissionModal({ submission: SUBMISSION }));
      const action = firstValueFrom(setup().openSubmissionModal$);

      (createOptions().nzOnOk as () => void)();

      expect(await action).toEqual(
        applyHistoricalSubmission({ submission: SUBMISSION }),
      );
    });

    it('reports a close on cancel', async () => {
      actions$ = of(openSubmissionModal({ submission: SUBMISSION }));
      const action = firstValueFrom(setup().openSubmissionModal$);

      (createOptions().nzOnCancel as () => void)();

      expect(await action).toEqual(closeSubmissionModal());
    });

    it('ignores further opens while a modal is open', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      setup().openSubmissionModal$.subscribe();

      actions.next(openSubmissionModal({ submission: SUBMISSION }));
      actions.next(openSubmissionModal({ submission: SUBMISSION }));

      expect(modal.create).toHaveBeenCalledOnce();
    });

    it('opens again once the previous modal is closed', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      setup().openSubmissionModal$.subscribe();

      actions.next(openSubmissionModal({ submission: SUBMISSION }));
      (createOptions(0).nzOnCancel as () => void)();
      actions.next(openSubmissionModal({ submission: SUBMISSION }));

      expect(modal.create).toHaveBeenCalledTimes(2);
    });
  });
});
