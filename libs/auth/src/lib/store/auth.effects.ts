import { HttpClient } from '@angular/common/http';
import { inject, Injectable, REQUEST } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import type {
  CreateSessionRequestBody,
  CreateSessionResponseBody,
  SessionResponseBody,
  SessionUser,
} from '@org/server';
import {
  Auth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  catchError,
  concat,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AuthActions } from './auth.actions';

/** Firebase's auth state, reduced to what the app needs. */
function firebaseUser$(auth: Auth): Observable<SessionUser | null> {
  return new Observable((observer) =>
    onAuthStateChanged(auth, (user) =>
      observer.next(user ? { uid: user.uid } : null),
    ),
  );
}

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly logger = inject(Logger);
  private readonly modal = inject(NzModalService);
  private readonly message = inject(NzMessageService);
  // Null on the server.
  private readonly auth = inject(AUTH);
  // Null in the browser and during the build's route extraction.
  private readonly request = inject(REQUEST, { optional: true });

  private readonly signedOut$ = this.actions$.pipe(
    ofType(AuthActions.clearCookie),
  );

  /**
   * First the server's view of the session cookie (during SSR via the
   * forwarded cookie; in the browser a synchronous transfer cache hit, so
   * the first client render matches the SSR markup). Then, in the browser,
   * Firebase's auth state.
   *
   * Firebase is only followed after the session call completes, so a slow
   * response can never overwrite newer state.
   */
  authState$ = createEffect(() => {
    // Neither a browser nor a real request: the build's route-extraction
    // pass. Nothing to load.
    if (!this.auth && !this.request) {
      return of(AuthActions.sessionLoaded({ user: null }));
    }

    const session$ = this.http.get<SessionResponseBody>('/api/session').pipe(
      map(({ user }) => AuthActions.sessionLoaded({ user })),
      catchError((error) => {
        this.logger.error('[auth] load session failed', error);
        // Treat as no session rather than leave the status unknown, which
        // would hold up route guards indefinitely.
        return of(AuthActions.sessionLoaded({ user: null }));
      }),
    );

    const firebase$ = this.auth
      ? firebaseUser$(this.auth).pipe(
          map((user) => AuthActions.firebaseUserChanged({ user })),
        )
      : EMPTY;

    return concat(session$, firebase$);
  });

  /** Mints or clears the session cookie whenever Firebase's user changes. */
  syncCookie$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.firebaseUserChanged),
      map(({ user }) =>
        user ? AuthActions.validateCookie({ user }) : AuthActions.clearCookie(),
      ),
    ),
  );

  loadToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.validateCookie),
      switchMap(({ user }) => {
        const firebaseUser = this.auth?.currentUser;

        if (!firebaseUser) {
          return EMPTY;
        }

        return from(firebaseUser.getIdToken()).pipe(
          map((token) => AuthActions.tokenLoaded({ token, user })),
          catchError((error: unknown) =>
            of(AuthActions.loadTokenFailed({ error })),
          ),
          takeUntil(this.signedOut$),
        );
      }),
    ),
  );

  validateCookie$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.tokenLoaded),
      switchMap(({ token, user }) =>
        this.http
          .post<CreateSessionResponseBody>('/api/session', {
            idToken: token,
          } satisfies CreateSessionRequestBody)
          .pipe(
            map(({ status }) =>
              status === 'created'
                ? AuthActions.cookieCreated({ user })
                : AuthActions.cookieValidated({ user }),
            ),
            catchError((error: unknown) =>
              of(AuthActions.validateCookieFailed({ error })),
            ),
            // Signed out mid-flight: don't report the stale user as signed in.
            takeUntil(this.signedOut$),
          ),
      ),
    ),
  );

  clearCookie$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.clearCookie),
      switchMap(() =>
        this.http.delete('/api/session').pipe(
          map(() => AuthActions.cookieCleared()),
          catchError((error: unknown) =>
            of(AuthActions.clearCookieFailed({ error })),
          ),
        ),
      ),
    ),
  );

  openSignInModal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.openSignInModal),
      switchMap(
        () =>
          new Observable<Action>((subscriber) => {
            this.modal.confirm({
              nzTitle: 'Sign in required',
              nzContent: 'Sign in with your Google account to continue.',
              nzOkText: 'Sign in with Google',
              nzCancelText: 'Cancel',
              nzOnOk: () =>
                subscriber.next(AuthActions.signIn({ provider: 'google' })),
              nzOnCancel: () => subscriber.next(AuthActions.closeSignInModal()),
            });
          }),
      ),
    ),
  );

  /**
   * On success the page navigates away to Google, so only failure is
   * reported back.
   */
  signIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signIn),
      filter(() => !!this.auth),
      switchMap(() =>
        signInWithRedirect(this.auth!, new GoogleAuthProvider()).then(
          () => null,
          (error: unknown) => AuthActions.signInFailed({ error }),
        ),
      ),
      filter((action) => action !== null),
    ),
  );

  signOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signOut),
      filter(() => !!this.auth),
      switchMap(() =>
        signOut(this.auth!)
          .then(() => AuthActions.signOutSucceeded())
          .catch((error: unknown) => AuthActions.signOutFailed({ error })),
      ),
    ),
  );

  signOutSucceeded$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signOutSucceeded),
        tap(() => this.message.success('Signed out')),
      ),
    { dispatch: false },
  );

  /** Logs every failure; the ones the user caused also get a toast. */
  failures$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AuthActions.signInFailed,
          AuthActions.signOutFailed,
          AuthActions.loadTokenFailed,
          AuthActions.validateCookieFailed,
          AuthActions.clearCookieFailed,
        ),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);

          if (type === AuthActions.signInFailed.type) {
            this.message.error('Failed to sign in');
          } else if (type === AuthActions.signOutFailed.type) {
            this.message.error('Failed to sign out');
          }
        }),
      ),
    { dispatch: false },
  );
}
