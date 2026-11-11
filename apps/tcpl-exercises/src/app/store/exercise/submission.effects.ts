import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { exhaustMap, Observable } from 'rxjs';
import {
  applyHistoricalSubmission,
  closeApplySubmissionModal,
  openApplySubmissionModal,
} from './exercise.actions';

@Injectable()
export class SubmissionEffects {
  private readonly actions$ = inject(Actions);
  private readonly modal = inject(NzModalService);

  openApplySubmissionModal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openApplySubmissionModal),
      // Ignores further requests while a modal is open. Each callback must
      // complete, or no later modal would ever open.
      exhaustMap(
        ({ submission }) =>
          new Observable<Action>((subscriber) => {
            this.modal.confirm({
              nzTitle: 'Restore this submission?',
              nzContent: 'Its code will replace the code in your editor.',
              nzOkText: 'Restore',
              nzCancelText: 'Cancel',
              nzOnOk: () => {
                subscriber.next(applyHistoricalSubmission({ submission }));
                subscriber.complete();
              },
              nzOnCancel: () => {
                subscriber.next(closeApplySubmissionModal());
                subscriber.complete();
              },
            });
          }),
      ),
    ),
  );
}
