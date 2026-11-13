import { inject, Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import type { SessionUser } from '@org/server';
import { filter, map, pairwise } from 'rxjs';
import { AuthActions } from './auth.actions';
import { authFeature, type AuthState } from './auth.feature';

/** The user whose session this change of state started, if it started one. */
function startedSessionFor([before, after]: [
  AuthState,
  AuthState,
]): SessionUser | null {
  // Not signed in now, so no session can have started.
  if (after.status !== 'signedIn') {
    return null;
  }

  // The page loaded signed in: its data was fetched with the cookie.
  if (before.status === 'unknown') {
    return null;
  }

  // Already signed in as this user: the cookie was only re-validated.
  if (before.user?.uid === after.user.uid) {
    return null;
  }

  return after.user;
}

@Injectable()
export class SessionStartedEffects {
  private readonly store = inject(Store);

  /**
   * The counterpart of sessionEnded$: this tab became signed in after it
   * loaded, so what it holds was fetched signed out (or as someone else).
   *
   * Watches the store rather than cookieCreated: when another tab signs in,
   * that tab's request mints the cookie and this one's only finds it valid,
   * yet this tab's data is just as stale.
   */
  sessionStarted$ = createEffect(() =>
    this.store.select(authFeature.selectAuthState).pipe(
      pairwise(),
      map(startedSessionFor),
      filter((user) => user !== null),
      map((user) => AuthActions.sessionStarted({ user })),
    ),
  );
}
