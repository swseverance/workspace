import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { AuthActions } from './auth.actions';
import { SignInEffects } from './sign-in.effects';

const firebase = vi.hoisted(() => ({
  signInWithRedirect: vi.fn(),
  GoogleAuthProvider: class {},
}));

vi.mock('firebase/auth', () => firebase);

describe('SignInEffects', () => {
  let actions$: Observable<Action>;
  const auth = {};
  const message = { error: vi.fn() };
  const logger = { error: vi.fn() };
  let afterClose: Subject<unknown>;
  const modal = { create: vi.fn(() => ({ afterClose })) };

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        SignInEffects,
        provideMockActions(() => actions$),
        { provide: AUTH, useValue: auth },
        { provide: NzMessageService, useValue: message },
        { provide: NzModalService, useValue: modal },
        { provide: Logger, useValue: logger },
      ],
    });
    return TestBed.inject(SignInEffects);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    afterClose = new Subject();
  });

  describe('openSignInModal$', () => {
    it('opens the sign-in dialog', () => {
      actions$ = of(AuthActions.openSignInModal());
      setup().openSignInModal$.subscribe();

      expect(modal.create).toHaveBeenCalledOnce();
    });

    it('signs in with Google when the dialog closes with it', async () => {
      actions$ = of(AuthActions.openSignInModal());
      const action = firstValueFrom(setup().openSignInModal$);

      afterClose.next({ provider: 'google' });

      expect(await action).toEqual(AuthActions.signIn({ provider: 'google' }));
    });

    it('reports a close when the dialog is dismissed', async () => {
      actions$ = of(AuthActions.openSignInModal());
      const action = firstValueFrom(setup().openSignInModal$);

      afterClose.next(undefined);

      expect(await action).toEqual(AuthActions.closeSignInModal());
    });

    it('ignores further opens while a modal is open', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      setup().openSignInModal$.subscribe();

      actions.next(AuthActions.openSignInModal());
      actions.next(AuthActions.openSignInModal());

      expect(modal.create).toHaveBeenCalledOnce();
    });

    it('opens again once the previous modal is closed', () => {
      const actions = new Subject<Action>();
      actions$ = actions;
      const emitted: Action[] = [];
      setup().openSignInModal$.subscribe((action) => emitted.push(action));

      actions.next(AuthActions.openSignInModal());
      afterClose.next(undefined);
      afterClose.complete();
      afterClose = new Subject();
      actions.next(AuthActions.openSignInModal());
      afterClose.next({ provider: 'google' });

      expect(modal.create).toHaveBeenCalledTimes(2);
      expect(emitted).toEqual([
        AuthActions.closeSignInModal(),
        AuthActions.signIn({ provider: 'google' }),
      ]);
    });
  });

  describe('signIn$', () => {
    it('redirects to Google', async () => {
      firebase.signInWithRedirect.mockResolvedValue(undefined);
      actions$ = of(AuthActions.signIn({ provider: 'google' }));

      expect(await firstValueFrom(setup().signIn$)).toEqual(
        AuthActions.signInSuccess(),
      );
      expect(firebase.signInWithRedirect).toHaveBeenCalledWith(
        auth,
        expect.any(firebase.GoogleAuthProvider),
      );
    });

    it('reports a failed redirect', async () => {
      const error = new Error('redirect failed');
      firebase.signInWithRedirect.mockRejectedValue(error);
      actions$ = of(AuthActions.signIn({ provider: 'google' }));

      expect(await firstValueFrom(setup().signIn$)).toEqual(
        AuthActions.signInFailed({ error }),
      );
    });
  });

  describe('signInFailed$', () => {
    it('logs and toasts the failure', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.signInFailed({ error }));

      await firstValueFrom(setup().signInFailed$);

      expect(logger.error).toHaveBeenCalledWith(
        '[auth] [Auth] Sign In Failed',
        error,
      );
      expect(message.error).toHaveBeenCalledWith('Failed to Sign In');
    });
  });
});
