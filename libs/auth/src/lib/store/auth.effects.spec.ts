import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { AuthActions } from './auth.actions';
import { AuthEffects } from './auth.effects';

const firebase = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/auth', () => firebase);

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  const logger = { error: vi.fn() };
  const message = { error: vi.fn() };

  function setup({
    auth = null as unknown,
    platformId = 'browser',
    request = null as Request | null,
  } = {}) {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH, useValue: auth },
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: REQUEST, useValue: request },
        { provide: Logger, useValue: logger },
        { provide: NzMessageService, useValue: message },
      ],
    });
    return {
      effects: TestBed.inject(AuthEffects),
      backend: TestBed.inject(HttpTestingController),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ngrxOnInitEffects', () => {
    it('starts by loading the session', () => {
      const { effects } = setup();

      expect(effects.ngrxOnInitEffects()).toEqual(AuthActions.loadSession());
    });
  });

  describe('loadSession$', () => {
    beforeEach(() => {
      actions$ = of(AuthActions.loadSession());
    });

    it.each([
      [
        'during a server render',
        'server',
        new Request('https://app.example.com/'),
      ],
      ['in the browser', 'browser', null],
    ])('reports the session cookie user %s', async (_, platformId, request) => {
      const { effects, backend } = setup({ platformId, request });

      const action = firstValueFrom(effects.loadSession$);
      backend.expectOne('/api/session').flush({ user: { uid: 'u1' } });

      expect(await action).toEqual(
        AuthActions.sessionLoaded({ user: { uid: 'u1' } }),
      );
    });

    it('reports no user when the server has no session', async () => {
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.loadSession$);
      backend.expectOne('/api/session').flush({ user: null });

      expect(await action).toEqual(AuthActions.sessionLoaded({ user: null }));
    });

    it('reports a failed session call', async () => {
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.loadSession$);
      backend
        .expectOne('/api/session')
        .flush(null, { status: 500, statusText: 'Error' });

      expect(await action).toEqual(
        AuthActions.loadSessionFailed({ error: expect.anything() }),
      );
    });

    it('skips the call during build-time route extraction', async () => {
      // On the server with no request.
      const { effects, backend } = setup({ platformId: 'server' });

      expect(await firstValueFrom(effects.loadSession$)).toEqual(
        AuthActions.sessionLoaded({ user: null }),
      );
      backend.expectNone('/api/session');
    });
  });

  describe('loadSessionFailed$', () => {
    it('logs and toasts the failure', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.loadSessionFailed({ error }));
      const { effects } = setup();

      await firstValueFrom(effects.loadSessionFailed$);

      expect(logger.error).toHaveBeenCalledOnce();
      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Load Session Failed',
        error,
      );
      expect(message.error).toHaveBeenCalledWith('Failed to Load Session');
    });
  });

  describe('firebaseUserChanged$', () => {
    it('follows Firebase once the session is loaded', () => {
      firebase.onAuthStateChanged.mockImplementation((_auth, next) => {
        next({ uid: 'u2' });
        return () => undefined;
      });
      const actions = new Subject<Action>();
      actions$ = actions;
      const { effects } = setup({ auth: {} });

      // Firebase's observable never completes, so collect then unsubscribe.
      const emitted: Action[] = [];
      const sub = effects.firebaseUserChanged$.subscribe((a) =>
        emitted.push(a),
      );
      expect(firebase.onAuthStateChanged).not.toHaveBeenCalled();

      actions.next(AuthActions.sessionLoaded({ user: null }));
      sub.unsubscribe();

      expect(emitted).toEqual([
        AuthActions.firebaseUserChanged({ user: { uid: 'u2' } }),
      ]);
    });

    it('also follows Firebase when the session call failed', () => {
      firebase.onAuthStateChanged.mockImplementation((_auth, next) => {
        next({ uid: 'u2' });
        return () => undefined;
      });
      actions$ = of(AuthActions.loadSessionFailed({ error: new Error('x') }));
      const { effects } = setup({ auth: {} });

      const emitted: Action[] = [];
      const sub = effects.firebaseUserChanged$.subscribe((a) =>
        emitted.push(a),
      );
      sub.unsubscribe();

      expect(emitted).toEqual([
        AuthActions.firebaseUserChanged({ user: { uid: 'u2' } }),
      ]);
    });

    it('reports a signed-out Firebase user as null', () => {
      firebase.onAuthStateChanged.mockImplementation((_auth, next) => {
        next(null);
        return () => undefined;
      });
      actions$ = of(AuthActions.sessionLoaded({ user: null }));
      const { effects } = setup({ auth: {} });

      const emitted: Action[] = [];
      effects.firebaseUserChanged$
        .subscribe((a) => emitted.push(a))
        .unsubscribe();

      expect(emitted).toEqual([
        AuthActions.firebaseUserChanged({ user: null }),
      ]);
    });

    it('replaces the listener on a later session result and removes it on unsubscribe', () => {
      const unsubscribes = [vi.fn(), vi.fn()];
      firebase.onAuthStateChanged
        .mockReturnValueOnce(unsubscribes[0])
        .mockReturnValueOnce(unsubscribes[1]);
      const actions = new Subject<Action>();
      actions$ = actions;
      const { effects } = setup({ auth: {} });

      const sub = effects.firebaseUserChanged$.subscribe();
      actions.next(AuthActions.sessionLoaded({ user: null }));
      actions.next(AuthActions.sessionLoaded({ user: null }));

      expect(unsubscribes[0]).toHaveBeenCalledOnce();
      expect(unsubscribes[1]).not.toHaveBeenCalled();

      sub.unsubscribe();
      expect(unsubscribes[1]).toHaveBeenCalledOnce();
    });

    it('does nothing on the server', () => {
      actions$ = of(AuthActions.sessionLoaded({ user: null }));
      const { effects } = setup();

      const emitted: Action[] = [];
      effects.firebaseUserChanged$.subscribe((a) => emitted.push(a));

      expect(emitted).toEqual([]);
      expect(firebase.onAuthStateChanged).not.toHaveBeenCalled();
    });
  });

  describe('syncCookie$', () => {
    it('validates the cookie when signed in and clears it when signed out', () => {
      actions$ = of(
        AuthActions.firebaseUserChanged({ user: { uid: 'u1' } }),
        AuthActions.firebaseUserChanged({ user: null }),
      );
      const { effects } = setup();

      const emitted: Action[] = [];
      effects.syncCookie$.subscribe((a) => emitted.push(a));

      expect(emitted).toEqual([
        AuthActions.validateCookie({ user: { uid: 'u1' } }),
        AuthActions.clearCookie(),
      ]);
    });
  });

  describe('loadToken$', () => {
    const user = { uid: 'u1' };

    function authWithToken(getIdToken: () => Promise<string>) {
      return { currentUser: { getIdToken } };
    }

    it('loads an ID token for the user', async () => {
      actions$ = of(AuthActions.validateCookie({ user }));
      const { effects } = setup({
        auth: authWithToken(() => Promise.resolve('id-token')),
      });

      expect(await firstValueFrom(effects.loadToken$)).toEqual(
        AuthActions.tokenLoaded({ token: 'id-token', user }),
      );
    });

    it('reports a failed token load', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.validateCookie({ user }));
      const { effects } = setup({
        auth: authWithToken(() => Promise.reject(error)),
      });

      expect(await firstValueFrom(effects.loadToken$)).toEqual(
        AuthActions.loadTokenFailed({ error }),
      );
    });

    it('drops the token when the user signs out before it arrives', async () => {
      let resolve!: (token: string) => void;
      const token = new Promise<string>((r) => (resolve = r));
      const actions = new Subject<Action>();
      actions$ = actions;
      const { effects } = setup({ auth: authWithToken(() => token) });

      const emitted: Action[] = [];
      effects.loadToken$.subscribe((a) => emitted.push(a));
      actions.next(AuthActions.validateCookie({ user }));
      actions.next(AuthActions.clearCookie());
      resolve('id-token');
      await token;

      expect(emitted).toEqual([]);
    });
  });

  describe('loadTokenFailed$', () => {
    it('logs and toasts the failure', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.loadTokenFailed({ error }));
      const { effects } = setup();

      await firstValueFrom(effects.loadTokenFailed$);

      expect(logger.error).toHaveBeenCalledOnce();
      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Load Token Failed',
        error,
      );
      expect(message.error).toHaveBeenCalledWith('Failed to Load Token');
    });
  });

  describe('validateCookie$', () => {
    const user = { uid: 'u1' };

    it.each([
      ['created', AuthActions.cookieCreated({ user })],
      ['valid', AuthActions.cookieValidated({ user })],
    ] as const)('maps "%s" from the server', async (status, expected) => {
      actions$ = of(AuthActions.tokenLoaded({ token: 'id-token', user }));
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.validateCookie$);
      const req = backend.expectOne('/api/session');
      req.flush({ status });

      expect(req.request.body).toEqual({ idToken: 'id-token' });
      expect(await action).toEqual(expected);
    });

    it('reports a failed session call', async () => {
      actions$ = of(AuthActions.tokenLoaded({ token: 'id-token', user }));
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.validateCookie$);
      backend
        .expectOne('/api/session')
        .flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(await action).toEqual(
        AuthActions.validateCookieFailed({ error: expect.anything() }),
      );
    });

    it('drops the result when the user signs out mid-flight', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      const { effects, backend } = setup();

      const emitted: Action[] = [];
      effects.validateCookie$.subscribe((a) => emitted.push(a));
      actions.next(AuthActions.tokenLoaded({ token: 'id-token', user }));
      const req = backend.expectOne('/api/session');
      actions.next(AuthActions.clearCookie());

      expect(req.cancelled).toBe(true);
      expect(emitted).toEqual([]);
    });
  });

  describe('validateCookieFailed$', () => {
    it('logs and toasts the failure', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.validateCookieFailed({ error }));
      const { effects } = setup();

      await firstValueFrom(effects.validateCookieFailed$);

      expect(logger.error).toHaveBeenCalledOnce();
      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Validate Cookie Failed',
        error,
      );
      expect(message.error).toHaveBeenCalledWith('Failed to Validate Cookie');
    });
  });

  describe('clearCookie$', () => {
    it('deletes the session', async () => {
      actions$ = of(AuthActions.clearCookie());
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.clearCookie$);
      const req = backend.expectOne('/api/session');
      req.flush(null);

      expect(req.request.method).toBe('DELETE');
      expect(await action).toEqual(AuthActions.cookieCleared());
    });

    it('reports a failed delete', async () => {
      actions$ = of(AuthActions.clearCookie());
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.clearCookie$);
      backend
        .expectOne('/api/session')
        .flush(null, { status: 500, statusText: 'Error' });

      expect(await action).toEqual(
        AuthActions.clearCookieFailed({ error: expect.anything() }),
      );
    });
  });

  describe('clearCookieFailed$', () => {
    it('logs and toasts the failure', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.clearCookieFailed({ error }));
      const { effects } = setup();

      await firstValueFrom(effects.clearCookieFailed$);

      expect(logger.error).toHaveBeenCalledOnce();
      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Clear Cookie Failed',
        error,
      );
      expect(message.error).toHaveBeenCalledWith('Failed to Clear Cookie');
    });
  });
});
