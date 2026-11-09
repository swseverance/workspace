import { inject, Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import type { SessionUser } from '@org/server';
import { filter, map, pairwise } from 'rxjs';
import { AuthActions } from './auth.actions';
import { authFeature } from './auth.feature';

@Injectable()
export class SessionEndedEffects {
  private readonly store = inject(Store);

  /**
   * Watches the store's user rather than an action: reducers run before
   * effects, so by the time an effect sees firebaseUserChanged(null) it can
   * no longer tell a sign-out from a page that loaded signed out. Firebase
   * syncs sign-outs between tabs, so this also fires in background tabs.
   *
   * An account switch passes through signingIn (no user), so it fires once
   * for the old user; the uid check keeps that true if it ever doesn't.
   */
  sessionEnded$ = createEffect(() =>
    this.store.select(authFeature.selectUser).pipe(
      pairwise(),
      filter(
        (pair): pair is [SessionUser, SessionUser | null] =>
          pair[0] !== null && pair[1]?.uid !== pair[0].uid,
      ),
      map(([user]) => AuthActions.sessionEnded({ user })),
    ),
  );
}
