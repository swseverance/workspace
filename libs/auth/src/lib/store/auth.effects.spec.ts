import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
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

  function setup({
    auth = null as unknown,
    request = null as Request | null,
  } = {}) {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH, useValue: auth },
        { provide: REQUEST, useValue: request },
        { provide: Logger, useValue: logger },
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

  describe('authState$', () => {
    it('reports the session cookie user during a server render', async () => {
      const { effects, backend } = setup({
        request: new Request('https://app.example.com/'),
      });

      const action = firstValueFrom(effects.authState$);
      backend.expectOne('/api/session').flush({ user: { uid: 'u1' } });

      expect(await action).toEqual(
        AuthActions.sessionLoaded({ user: { uid: 'u1' } }),
      );
    });

    it('reports no session when the session call fails', async () => {
      const { effects, backend } = setup({
        request: new Request('https://app.example.com/'),
      });

      const action = firstValueFrom(effects.authState$);
      backend
        .expectOne('/api/session')
        .flush(null, { status: 500, statusText: 'Error' });

      expect(await action).toEqual(AuthActions.sessionLoaded({ user: null }));
    });

    it('then follows Firebase in the browser, only after the session call', () => {
      firebase.onAuthStateChanged.mockImplementation((_auth, next) => {
        next({ uid: 'u2' });
        return () => undefined;
      });
      const { effects, backend } = setup({ auth: {} });

      // Firebase's observable never completes, so collect then unsubscribe.
      const emitted: Action[] = [];
      const sub = effects.authState$.subscribe((a) => emitted.push(a));
      expect(emitted).toEqual([]);
      backend.expectOne('/api/session').flush({ user: null });
      sub.unsubscribe();

      expect(emitted).toEqual([
        AuthActions.sessionLoaded({ user: null }),
        AuthActions.firebaseUserChanged({ user: { uid: 'u2' } }),
      ]);
    });

    it('reports no session during the build, with no browser or request', async () => {
      const { effects } = setup();

      expect(await firstValueFrom(effects.authState$)).toEqual(
        AuthActions.sessionLoaded({ user: null }),
      );
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
  });

  describe('failures$', () => {
    it('logs cookie sync failures', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.validateCookieFailed({ error }));
      const { effects } = setup();

      await firstValueFrom(effects.failures$);

      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Validate Cookie Failed',
        error,
      );
    });
  });
});
