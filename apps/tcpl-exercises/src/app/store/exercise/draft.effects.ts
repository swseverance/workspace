import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthActions } from '@org/auth';
import { filter, map, mergeMap, of, tap, withLatestFrom } from 'rxjs';
import { DraftStore } from '../../services/draft-store';
import {
  applyHistoricalSubmission,
  codeEdited,
  draftRestored,
  exerciseNavigationSucceeded,
  exerciseRefreshed,
  exerciseSubmitted,
} from './exercise.actions';
import { selectId } from './exercise.selectors';

/** Keeps unsubmitted code in this browser (see DraftStore). */
@Injectable()
export class DraftEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly drafts = inject(DraftStore);

  /** Every edit, so a closed tab loses nothing. Writes are small and fast. */
  saveDraft$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(codeEdited, applyHistoricalSubmission),
        map((action) =>
          action.type === codeEdited.type
            ? action.code
            : action.submission.code,
        ),
        withLatestFrom(this.store.select(selectId)),
        tap(([code, id]) => this.drafts.set(id, code)),
      ),
    { dispatch: false },
  );

  /**
   * After the server's copy loads, puts back a draft typed since the latest
   * submission. A draft older than that (say the user has since submitted
   * from another device) is out of date, so it's deleted instead.
   */
  restoreDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(exerciseNavigationSucceeded, exerciseRefreshed),
      mergeMap(({ exercise }) => {
        const draft = this.drafts.get(exercise.id);

        if (!draft || draft.code === exercise.code) {
          return of();
        }

        const latest = exercise.submissions[0]?.created;

        if (latest && latest > draft.savedAt) {
          this.drafts.delete(exercise.id);
          return of();
        }

        return of(draftRestored({ id: exercise.id, code: draft.code }));
      }),
    ),
  );

  /**
   * The server saved the submitted code, unless the user typed since. A
   * signed-out submission isn't saved (no submissions come back), so its
   * draft is all that keeps the code.
   */
  deleteSubmittedDraft$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(exerciseSubmitted),
        filter(
          ({ exercise }) =>
            exercise.submissions.length > 0 &&
            this.drafts.get(exercise.id)?.code === exercise.code,
        ),
        tap(({ exercise }) => this.drafts.delete(exercise.id)),
      ),
    { dispatch: false },
  );

  /** Leaves nothing behind for the next person on a shared computer. */
  clearDrafts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.sessionEnded),
        tap(() => this.drafts.clear()),
      ),
    { dispatch: false },
  );
}
