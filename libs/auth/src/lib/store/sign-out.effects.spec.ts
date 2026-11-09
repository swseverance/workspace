import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthActions } from './auth.actions';
import { SignOutEffects } from './sign-out.effects';

const firebase = vi.hoisted(() => ({
  signOut: vi.fn(),
}));

vi.mock('firebase/auth', () => firebase);

describe('SignOutEffects', () => {
  let actions$: Observable<Action>;
  const auth = {};
  const message = { success: vi.fn(), error: vi.fn() };
  const logger = { error: vi.fn() };

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        SignOutEffects,
        provideMockActions(() => actions$),
        { provide: AUTH, useValue: auth },
        { provide: NzMessageService, useValue: message },
        { provide: Logger, useValue: logger },
      ],
    });
    return TestBed.inject(SignOutEffects);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signOut$', () => {
    it('signs out of Firebase', async () => {
      firebase.signOut.mockResolvedValue(undefined);
      actions$ = of(AuthActions.signOut());

      expect(await firstValueFrom(setup().signOut$)).toEqual(
        AuthActions.signOutSuccess(),
      );
      expect(firebase.signOut).toHaveBeenCalledWith(auth);
    });

    it('reports a failed sign-out', async () => {
      const error = new Error('network');
      firebase.signOut.mockRejectedValue(error);
      actions$ = of(AuthActions.signOut());

      expect(await firstValueFrom(setup().signOut$)).toEqual(
        AuthActions.signOutFailed({ error }),
      );
    });
  });

  describe('signOutSuccess$', () => {
    it('toasts the sign-out', async () => {
      actions$ = of(AuthActions.signOutSuccess());

      await firstValueFrom(setup().signOutSuccess$);

      expect(message.success).toHaveBeenCalledWith('Signed out');
    });
  });

  describe('signOutFailed$', () => {
    it('logs and toasts the failure', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.signOutFailed({ error }));

      await firstValueFrom(setup().signOutFailed$);

      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Sign Out Failed',
        error,
      );
      expect(message.error).toHaveBeenCalledWith('Failed to sign out');
    });
  });
});
