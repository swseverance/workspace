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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { AuthActions } from './auth.actions';
import { AuthEffects } from './auth.effects';

const firebase = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  ...firebase,
  GoogleAuthProvider: class {},
}));

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  const message = { success: vi.fn(), error: vi.fn() };
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
        { provide: NzMessageService, useValue: message },
        { provide: Logger, useValue: logger },
        { provide: NzModalService, useValue: { confirm: vi.fn() } },
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

  describe('stateChanged$', () => {
    it('reports the session cookie user during a server render', async () => {
      const { effects, backend } = setup({
        request: new Request('https://app.example.com/'),
      });

      const action = firstValueFrom(effects.stateChanged$);
      backend.expectOne('/api/session').flush({ user: { uid: 'u1' } });

      expect(await action).toEqual(
        AuthActions.stateChanged({ user: { uid: 'u1' } }),
      );
    });

    it('then follows Firebase in the browser', () => {
      firebase.onAuthStateChanged.mockImplementation((_auth, next) => {
        next({ uid: 'u2' });
        return () => undefined;
      });
      const { effects, backend } = setup({ auth: {} });

      // Firebase's observable never completes, so collect then unsubscribe.
      const emitted: Action[] = [];
      const sub = effects.stateChanged$.subscribe((a) => emitted.push(a));
      backend.expectOne('/api/session').flush({ user: null });
      sub.unsubscribe();

      expect(emitted).toEqual([
        AuthActions.stateChanged({ user: null }),
        AuthActions.stateChanged({ user: { uid: 'u2' } }),
      ]);
    });

    it('reports signed out during the build, with no browser or request', async () => {
      const { effects } = setup();

      expect(await firstValueFrom(effects.stateChanged$)).toEqual(
        AuthActions.stateChanged({ user: null }),
      );
    });
  });

  describe('syncCookie$', () => {
    it('validates the cookie when signed in and clears it when signed out', () => {
      const users = new Subject<{ uid: string } | null>();
      firebase.onAuthStateChanged.mockImplementation((_auth, next) => {
        const sub = users.subscribe(next);
        return () => sub.unsubscribe();
      });
      const { effects } = setup({ auth: {} });

      const emitted: Action[] = [];
      effects.syncCookie$.subscribe((a) => emitted.push(a));
      users.next({ uid: 'u1' });
      users.next(null);

      expect(emitted).toEqual([
        AuthActions.validateCookie(),
        AuthActions.clearCookie(),
      ]);
    });
  });

  describe('validateCookie$', () => {
    it.each([
      ['created', AuthActions.cookieCreated()],
      ['valid', AuthActions.cookieValidated()],
    ] as const)('maps "%s" from the server', async (status, expected) => {
      actions$ = of(AuthActions.tokenLoaded({ token: 'id-token' }));
      const { effects, backend } = setup();

      const action = firstValueFrom(effects.validateCookie$);
      const req = backend.expectOne('/api/session');
      req.flush({ status });

      expect(req.request.body).toEqual({ idToken: 'id-token' });
      expect(await action).toEqual(expected);
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

  describe('signIn$', () => {
    it('reports a failed redirect', async () => {
      const error = new Error('popup blocked');
      firebase.signInWithRedirect.mockRejectedValue(error);
      actions$ = of(AuthActions.signIn({ provider: 'google' }));
      const { effects } = setup({ auth: {} });

      expect(await firstValueFrom(effects.signIn$)).toEqual(
        AuthActions.signInFailed({ error }),
      );
    });
  });

  describe('failures$', () => {
    it('toasts sign-in failures', async () => {
      actions$ = of(AuthActions.signInFailed({ error: new Error('x') }));
      const { effects } = setup();

      await firstValueFrom(effects.failures$);

      expect(message.error).toHaveBeenCalledWith('Failed to sign in');
      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Sign In Failed',
        expect.any(Error),
      );
    });
  });
});
