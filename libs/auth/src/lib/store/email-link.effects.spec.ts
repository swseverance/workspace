import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { WINDOW } from '@org/window';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom, Observable, of, Subject, toArray } from 'rxjs';
import { AuthActions } from './auth.actions';
import {
  EMAIL_FOR_SIGN_IN_KEY,
  EmailLinkEffects,
  withoutEmailLinkParams,
} from './email-link.effects';

const firebase = vi.hoisted(() => ({
  isSignInWithEmailLink: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  signInWithEmailLink: vi.fn(),
}));

vi.mock('firebase/auth', () => firebase);

const LINK =
  'https://example.com/exercises/1-1?apiKey=k&oobCode=c&mode=signIn&lang=en';

describe('withoutEmailLinkParams', () => {
  it("removes Firebase's params and keeps the app's own", () => {
    expect(withoutEmailLinkParams(`${LINK}&tab=2#top`)).toBe(
      'https://example.com/exercises/1-1?tab=2#top',
    );
  });
});

describe('EmailLinkEffects', () => {
  let actions$: Observable<Action>;
  let storage: Map<string, string>;
  let window: {
    location: { href: string };
    history: { state: unknown; replaceState: ReturnType<typeof vi.fn> };
    localStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  };
  const auth = {};
  const message = { error: vi.fn() };
  const logger = { error: vi.fn() };
  let afterClose: Subject<unknown>;
  const modal = { create: vi.fn(() => ({ afterClose })) };

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        EmailLinkEffects,
        provideMockActions(() => actions$),
        { provide: AUTH, useValue: auth },
        { provide: WINDOW, useValue: window },
        { provide: NzMessageService, useValue: message },
        { provide: NzModalService, useValue: modal },
        { provide: Logger, useValue: logger },
      ],
    });
    return TestBed.inject(EmailLinkEffects);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    actions$ = of();
    afterClose = new Subject();
    storage = new Map();
    window = {
      location: { href: 'https://example.com/exercises/1-1' },
      history: { state: { id: 1 }, replaceState: vi.fn() },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => void storage.set(key, value),
        removeItem: (key) => void storage.delete(key),
      },
    };
    firebase.isSignInWithEmailLink.mockReturnValue(false);
  });

  describe('sendSignInLink$', () => {
    it('emails a link back to this page and remembers the address', async () => {
      firebase.sendSignInLinkToEmail.mockResolvedValue(undefined);
      actions$ = of(AuthActions.sendSignInLink({ email: 'a@b.com' }));

      expect(await firstValueFrom(setup().sendSignInLink$)).toEqual(
        AuthActions.signInLinkSent({ email: 'a@b.com' }),
      );
      expect(firebase.sendSignInLinkToEmail).toHaveBeenCalledWith(
        auth,
        'a@b.com',
        { url: 'https://example.com/exercises/1-1', handleCodeInApp: true },
      );
      expect(storage.get(EMAIL_FOR_SIGN_IN_KEY)).toBe('a@b.com');
    });

    it('reports a failure', async () => {
      const error = new Error('quota');
      firebase.sendSignInLinkToEmail.mockRejectedValue(error);
      actions$ = of(AuthActions.sendSignInLink({ email: 'a@b.com' }));

      expect(await firstValueFrom(setup().sendSignInLink$)).toEqual(
        AuthActions.sendSignInLinkFailed({ error }),
      );
      expect(storage.has(EMAIL_FOR_SIGN_IN_KEY)).toBe(false);
    });
  });

  describe('completeSignIn$', () => {
    beforeEach(() => {
      window.location.href = LINK;
      firebase.isSignInWithEmailLink.mockReturnValue(true);
    });

    it('does nothing for an ordinary page load', async () => {
      firebase.isSignInWithEmailLink.mockReturnValue(false);

      expect(
        await firstValueFrom(setup().completeSignIn$.pipe(toArray())),
      ).toEqual([]);
      expect(window.history.replaceState).not.toHaveBeenCalled();
    });

    it('signs in with the remembered address and cleans up', async () => {
      storage.set(EMAIL_FOR_SIGN_IN_KEY, 'a@b.com');
      firebase.signInWithEmailLink.mockResolvedValue({});

      expect(await firstValueFrom(setup().completeSignIn$)).toEqual(
        AuthActions.signInSuccess(),
      );
      expect(firebase.signInWithEmailLink).toHaveBeenCalledWith(
        auth,
        'a@b.com',
        LINK,
      );
      expect(window.history.replaceState).toHaveBeenCalledWith(
        { id: 1 },
        '',
        'https://example.com/exercises/1-1',
      );
      expect(storage.has(EMAIL_FOR_SIGN_IN_KEY)).toBe(false);
      expect(modal.create).not.toHaveBeenCalled();
    });

    it('asks for the address on a device that did not request the link', async () => {
      firebase.signInWithEmailLink.mockResolvedValue({});
      const action = firstValueFrom(setup().completeSignIn$);

      afterClose.next({ email: 'a@b.com' });

      expect(await action).toEqual(AuthActions.signInSuccess());
      expect(modal.create).toHaveBeenCalledOnce();
      expect(firebase.signInWithEmailLink).toHaveBeenCalledWith(
        auth,
        'a@b.com',
        LINK,
      );
    });

    it('gives up when that prompt is dismissed', async () => {
      const actions = firstValueFrom(setup().completeSignIn$.pipe(toArray()));

      afterClose.next(undefined);
      afterClose.complete();

      expect(await actions).toEqual([]);
      expect(firebase.signInWithEmailLink).not.toHaveBeenCalled();
    });

    it('reports an expired or used link', async () => {
      const error = new Error('auth/invalid-action-code');
      storage.set(EMAIL_FOR_SIGN_IN_KEY, 'a@b.com');
      firebase.signInWithEmailLink.mockRejectedValue(error);

      expect(await firstValueFrom(setup().completeSignIn$)).toEqual(
        AuthActions.emailLinkSignInFailed({ error }),
      );
    });

    it('does nothing on the server', async () => {
      TestBed.overrideProvider(AUTH, { useValue: null });

      expect(
        await firstValueFrom(setup().completeSignIn$.pipe(toArray())),
      ).toEqual([]);
    });
  });

  describe('failure messages', () => {
    it('toasts a failed send', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.sendSignInLinkFailed({ error }));

      await firstValueFrom(setup().sendSignInLinkFailed$);

      expect(logger.error).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith('Failed to Send Sign-in Link');
    });

    it('toasts a failed link sign-in', async () => {
      const error = new Error('x');
      actions$ = of(AuthActions.emailLinkSignInFailed({ error }));

      await firstValueFrom(setup().emailLinkSignInFailed$);

      expect(message.error).toHaveBeenCalledWith(
        "Couldn't sign in with that link. It may have expired or already been used.",
      );
    });
  });
});
