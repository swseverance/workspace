import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AUTH } from '@org/firebase';
import { Logger } from '@org/logger';
import { signOut } from 'firebase/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { switchMap, tap } from 'rxjs';
import { AuthActions } from './auth.actions';

@Injectable()
export class SignOutEffects {
  private readonly actions$ = inject(Actions);
  private readonly logger = inject(Logger);
  private readonly message = inject(NzMessageService);
  private readonly auth = inject(AUTH);

  signOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signOut),
      switchMap(() =>
        signOut(this.auth!)
          .then(() => AuthActions.signOutSuccess())
          .catch((error: unknown) => AuthActions.signOutFailed({ error })),
      ),
    ),
  );

  signOutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signOutSuccess),
        tap(() => this.message.success('Signed out')),
      ),
    { dispatch: false },
  );

  signOutFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signOutFailed),
        tap(({ type, error }) => {
          this.logger.error(`[auth] ${type}`, error);
          this.message.error('Failed to sign out');
        }),
      ),
    { dispatch: false },
  );
}
