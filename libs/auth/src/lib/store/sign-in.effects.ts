import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { exhaustMap, map, switchMap, tap } from 'rxjs';
import {
  SignInDialog,
  SignInDialogData,
  SignInDialogResult,
} from '../sign-in-dialog/sign-in-dialog';
import { AuthActions } from './auth.actions';

@Injectable()
export class SignInEffects {
  private readonly actions$ = inject(Actions);
  private readonly logger = inject(Logger);
  private readonly modal = inject(NzModalService);
  private readonly message = inject(NzMessageService);
  private readonly auth = inject(AUTH);

  /**
   * Google, or a sign-in link by email. Sending the link happens inside the
   * dialog (it shows "check your inbox"), so closing it only ever means
   * Google or dismissed.
   */
  openSignInModal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.openSignInModal),
      // Ignores further requests while a modal is open. Each one must
      // complete, or no later modal would ever open.
      exhaustMap(() =>
        this.modal
          .create<SignInDialog, SignInDialogData, SignInDialogResult>({
            nzTitle: 'Sign in',
            nzContent: SignInDialog,
            nzData: { mode: 'signIn' },
            nzFooter: null,
          })
          .afterClose.pipe(
            map((result) =>
              result && 'provider' in result
                ? AuthActions.signIn({ provider: result.provider })
                : AuthActions.closeSignInModal(),
            ),
          ),
      ),
    ),
  );

  // AuthActions.signInSuccess() will never actually fire because of redirect but is there for consistency
  signIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signIn),
      switchMap(() =>
        signInWithRedirect(this.auth!, new GoogleAuthProvider()).then(
          () => AuthActions.signInSuccess(),
          (error: unknown) => AuthActions.signInFailed({ error }),
        ),
      ),
    ),
  );

  signInFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signInFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to Sign In');
        }),
      ),
    { dispatch: false },
  );
}
