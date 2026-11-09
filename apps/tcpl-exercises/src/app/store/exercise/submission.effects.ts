import { formatDate } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { exhaustMap, Observable } from 'rxjs';
import {
  SubmissionCode,
  SubmissionCodeData,
} from '../../components/submission-code/submission-code';
import {
  applyHistoricalSubmission,
  closeSubmissionModal,
  openSubmissionModal,
} from './exercise.actions';

@Injectable()
export class SubmissionEffects {
  private readonly actions$ = inject(Actions);
  private readonly modal = inject(NzModalService);
  private readonly locale = inject(LOCALE_ID);

  openSubmissionModal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openSubmissionModal),
      // Ignores further requests while a modal is open. The callback must
      // complete, or no later modal would ever open.
      exhaustMap(
        ({ submission }) =>
          new Observable<Action>((subscriber) => {
            this.modal.create<SubmissionCode, SubmissionCodeData>({
              nzTitle: `Submission from ${formatDate(submission.created, 'medium', this.locale)}`,
              nzContent: SubmissionCode,
              nzData: { submission },
              nzWidth: '800px',
              nzOkText: 'Apply',
              nzCancelText: 'Close',
              nzOnOk: () => {
                subscriber.next(applyHistoricalSubmission({ submission }));
                subscriber.complete();
              },
              // Covers the Close button, the X, the mask and Escape.
              nzOnCancel: () => {
                subscriber.next(closeSubmissionModal());
                subscriber.complete();
              },
            });
          }),
      ),
    ),
  );
}
