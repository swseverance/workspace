import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { exhaustMap, Observable, switchMap, tap } from 'rxjs';
import { AuthActions } from './auth.actions';

@Injectable()
export class SignInEffects {
  private readonly actions$ = inject(Actions);
  private readonly logger = inject(Logger);
  private readonly modal = inject(NzModalService);
  private readonly message = inject(NzMessageService);
  private readonly auth = inject(AUTH);

  openSignInModal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.openSignInModal),
      // Ignores further requests while a modal is open. Each callback must
      // complete, or no later modal would ever open.
      exhaustMap(
        () =>
          new Observable<Action>((subscriber) => {
            this.modal.confirm({
              nzTitle: 'Sign in required',
              nzContent: 'Sign in with your Google account to continue.',
              nzOkText: 'Sign in with Google',
              nzCancelText: 'Cancel',
              nzOnOk: () => {
                subscriber.next(AuthActions.signIn({ provider: 'google' }));
                subscriber.complete();
              },
              nzOnCancel: () => {
                subscriber.next(AuthActions.closeSignInModal());
                subscriber.complete();
              },
            });
          }),
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
