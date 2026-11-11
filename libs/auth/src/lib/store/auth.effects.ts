import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
  type OnInitEffects,
} from '@ngrx/effects';
import type { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import type {
  CreateSessionRequestBody,
  CreateSessionResponseBody,
  SessionResponseBody,
} from '@org/server';
import { onAuthStateChanged } from 'firebase/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  catchError,
  EMPTY,
  from,
  map,
  Observable,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects implements OnInitEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly logger = inject(Logger);
  // Null on the server.
  private readonly auth = inject(AUTH);
  private readonly message = inject(NzMessageService);
  private readonly platformId = inject(PLATFORM_ID);
  // Null in the browser and during build-time route extraction.
  private readonly request = inject(REQUEST, { optional: true });

  private readonly signedOut$ = this.actions$.pipe(
    ofType(AuthActions.clearCookie),
  );

  /** Starts the auth flow once the effects are registered. */
  ngrxOnInitEffects(): Action {
    return AuthActions.loadSession();
  }

  /**
   * GET /api/session
   *
   * SSR:
   *   cookie is taken from actual client request (if present)
   *   and attached to the SSR GET /api/session request by the
   *   forwardCookieInterceptor
   *
   * Browser:
   *   When this effect fires in the browser it SYNCHRONOUSLY reads the
   *   SessionResponseBody from the transfer cache (no network call actually
   *   takes place) whether the user has a cookie or not
   */
  loadSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadSession),
      switchMap(() => {
        // The Angular CLI starts the server app at build time to read its
        // routes. There's no request then, so no session to load.
        const isBuildRouteExtraction =
          isPlatformServer(this.platformId) && !this.request;

        if (isBuildRouteExtraction) {
          return of(AuthActions.sessionLoaded({ user: null }));
        }

        return this.http.get<SessionResponseBody>('/api/session').pipe(
          map(({ user }) => AuthActions.sessionLoaded({ user })),
          catchError((error: unknown) =>
            of(AuthActions.loadSessionFailed({ error })),
          ),
        );
      }),
    ),
  );

  loadSessionFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadSessionFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to Load Session');
        }),
      ),
    { dispatch: false },
  );

  /**
   * Follows Firebase's auth state in the browser, starting only once the
   * session call has finished, either way. Reducers run before effects, so
   * the session result is always in the store first and a slow session
   * response can't overwrite newer Firebase state.
   */
  firebaseUserChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sessionLoaded, AuthActions.loadSessionFailed),
      switchMap(() => {
        const auth = this.auth;

        // Null on the server, including build-time route extraction.
        if (!auth) {
          return EMPTY;
        }

        // Unsubscribing removes the Firebase listener.
        return new Observable<Action>((subscriber) =>
          onAuthStateChanged(auth, (user) =>
            subscriber.next(
              AuthActions.firebaseUserChanged({
                user: user ? { uid: user.uid } : null,
              }),
            ),
          ),
        );
      }),
    ),
  );

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
      // Dispatched synchronously from Firebase's listener, which sets
      // currentUser first, so neither is null here.
      switchMap(({ user }) =>
        from(this.auth!.currentUser!.getIdToken()).pipe(
          map((token) => AuthActions.tokenLoaded({ token, user })),
          catchError((error: unknown) =>
            of(AuthActions.loadTokenFailed({ error })),
          ),
          takeUntil(this.signedOut$),
        ),
      ),
    ),
  );

  loadTokenFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadTokenFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to Load Token');
        }),
      ),
    { dispatch: false },
  );

  // POST { idToken } to /api/session. The server responds:
  // - { status: 'valid' }: the request's cookie is valid and for this user
  // - { status: 'created' }: it set a new cookie from the token
  // An error (e.g. a rejected token) becomes validateCookieFailed.
  // If cookieCreated or cookieValidated is dispatched we now consider
  // the user to be completely signedIn
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

  validateCookieFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.validateCookieFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to Validate Cookie');
        }),
      ),
    { dispatch: false },
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

  clearCookieFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.clearCookieFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to Clear Cookie');
        }),
      ),
    { dispatch: false },
  );
}
