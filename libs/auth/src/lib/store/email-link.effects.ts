import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { WINDOW } from '@org/window';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  defer,
  EMPTY,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  SignInDialog,
  SignInDialogData,
  SignInDialogResult,
} from '../sign-in-dialog/sign-in-dialog';
import { AuthActions } from './auth.actions';

/** Where the address a link was sent to is kept until the link is opened. */
export const EMAIL_FOR_SIGN_IN_KEY = 'auth:emailForSignIn';

/** The query params Firebase adds to the URL an emailed link opens. */
const EMAIL_LINK_PARAMS = [
  'apiKey',
  'oobCode',
  'mode',
  'lang',
  'continueUrl',
  'tenantId',
];

export function withoutEmailLinkParams(href: string): string {
  const url = new URL(href);
  EMAIL_LINK_PARAMS.forEach((param) => url.searchParams.delete(param));
  return url.toString();
}

/**
 * Passwordless sign-in: Firebase emails a link, and opening it signs in.
 * Registered only for apps with emailLink set. Like any other sign-in, the
 * auth state listener then mints the session cookie.
 */
@Injectable()
export class EmailLinkEffects {
  private readonly actions$ = inject(Actions);
  private readonly logger = inject(Logger);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  // Both null on the server.
  private readonly auth = inject(AUTH);
  private readonly window = inject(WINDOW);

  /** The link brings the user back to the page they asked from. */
  sendSignInLink$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sendSignInLink),
      switchMap(({ email }) =>
        sendSignInLinkToEmail(this.auth!, email, {
          url: withoutEmailLinkParams(this.window!.location.href),
          handleCodeInApp: true,
        }).then(
          () => {
            this.storeEmail(email);
            return AuthActions.signInLinkSent({ email });
          },
          (error: unknown) => AuthActions.sendSignInLinkFailed({ error }),
        ),
      ),
    ),
  );

  sendSignInLinkFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.sendSignInLinkFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to Send Sign-in Link');
        }),
      ),
    { dispatch: false },
  );

  /**
   * Signs in when this page was opened from an emailed link. Not driven by
   * an action: effects subscribe once, when registered, so this runs once
   * per page load in the browser. The link's params are removed from the
   * URL straight away, so a reload doesn't try the used link again.
   */
  completeSignIn$ = createEffect(() =>
    // defer: a fresh observable per instance, as createEffect marks the one
    // it's given (EMPTY is shared).
    defer(() => {
      const auth = this.auth;
      const href = this.window?.location.href;

      if (!auth || !href || !isSignInWithEmailLink(auth, href)) {
        return EMPTY;
      }

      this.window!.history.replaceState(
        this.window!.history.state,
        '',
        withoutEmailLinkParams(href),
      );

      // Opened on another device (or the address was cleared): ask for it.
      const stored = this.readEmail();
      const email$: Observable<string | undefined> = stored
        ? of(stored)
        : this.askForEmail();

      return email$.pipe(
        filter((email): email is string => Boolean(email)),
        switchMap((email) =>
          signInWithEmailLink(auth, email, href).then(
            () => {
              this.removeEmail();
              return AuthActions.signInSuccess();
            },
            (error: unknown) => AuthActions.emailLinkSignInFailed({ error }),
          ),
        ),
      );
    }),
  );

  emailLinkSignInFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.emailLinkSignInFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error(
            "Couldn't sign in with that link. It may have expired or already been used.",
          );
        }),
      ),
    { dispatch: false },
  );

  private askForEmail(): Observable<string | undefined> {
    const data: SignInDialogData = { mode: 'confirmEmail' };
    return this.modal
      .create<SignInDialog, SignInDialogData, SignInDialogResult>({
        nzTitle: 'Confirm your email',
        nzContent: SignInDialog,
        nzData: data,
        nzFooter: null,
      })
      .afterClose.pipe(
        map((result) =>
          result && 'email' in result ? result.email : undefined,
        ),
      );
  }

  // localStorage can be blocked; then the user is asked for the address.
  private readEmail(): string | null {
    try {
      return this.window!.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
    } catch {
      return null;
    }
  }

  private storeEmail(email: string): void {
    try {
      this.window!.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
    } catch {
      // Asked for again when the link is opened.
    }
  }

  private removeEmail(): void {
    try {
      this.window!.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    } catch {
      // Nothing to do.
    }
  }
}
