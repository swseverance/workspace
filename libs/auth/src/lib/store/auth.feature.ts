import { createFeature, createReducer, on } from '@ngrx/store';
import type { SessionUser } from '@org/server';
import { AuthActions } from './auth.actions';

/**
 * - `unknown`: nothing loaded yet. Route guards wait.
 * - `noSession`: the server has no valid session cookie, but Firebase hasn't
 *   been heard from (always the case during SSR). The user may still turn
 *   out to be signed in, e.g. returning from the sign-in redirect, so don't
 *   offer to sign in yet. Route guards redirect: the API would reject calls.
 * - `signingIn`: Firebase has a user and the session cookie is being
 *   created. Route guards wait.
 * - `signedIn`: the server holds a valid session cookie for `user`, so API
 *   calls made now are authenticated.
 * - `signedOut`: confirmed signed out (by Firebase, or the cookie couldn't
 *   be created).
 */
export type AuthStatus =
  'unknown' | 'noSession' | 'signingIn' | 'signedIn' | 'signedOut';

export type AuthState =
  | { status: Exclude<AuthStatus, 'signedIn'>; user: null }
  | { status: 'signedIn'; user: SessionUser };

export const initialAuthState: AuthState = {
  status: 'unknown',
  user: null,
};

const signedOut: AuthState = { status: 'signedOut', user: null };

/** Registered under `auth`; provides `selectStatus` and `selectUser`. */
export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer<AuthState>(
    initialAuthState,
    on(AuthActions.sessionLoaded, (_state, { user }): AuthState =>
      user ? { status: 'signedIn', user } : { status: 'noSession', user: null },
    ),
    on(AuthActions.firebaseUserChanged, (state, { user }): AuthState => {
      if (!user) {
        return signedOut;
      }

      // Already have a session for this user (cookie re-validated in the
      // background), so stay signed in rather than flicker.
      if (state.status === 'signedIn' && state.user.uid === user.uid) {
        return state;
      }

      return { status: 'signingIn', user: null };
    }),
    on(
      AuthActions.cookieCreated,
      AuthActions.cookieValidated,
      (_state, { user }): AuthState => ({ status: 'signedIn', user }),
    ),
    on(
      AuthActions.loadTokenFailed,
      AuthActions.validateCookieFailed,
      (): AuthState => signedOut,
    ),
  ),
});
