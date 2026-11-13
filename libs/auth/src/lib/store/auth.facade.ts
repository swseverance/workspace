import { inject, Service } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { AuthActions } from './auth.actions';
import { authFeature } from './auth.feature';

/** What components use: the signed-in user and the sign-in/out actions. */
@Service()
export class AuthFacade {
  private readonly store = inject(Store);

  readonly user$ = this.store.select(authFeature.selectUser);

  readonly status$ = this.store.select(authFeature.selectStatus);

  /**
   * Each sendSignInLink's outcome: the address the link went to, or null
   * when sending failed (already logged and toasted).
   */
  readonly signInLinkResult$: Observable<string | null> = inject(Actions).pipe(
    ofType(AuthActions.signInLinkSent, AuthActions.sendSignInLinkFailed),
    map((action) =>
      action.type === AuthActions.signInLinkSent.type ? action.email : null,
    ),
  );

  openSignInModal(): void {
    this.store.dispatch(AuthActions.openSignInModal());
  }

  signIn(): void {
    this.store.dispatch(AuthActions.signIn({ provider: 'google' }));
  }

  /** Emails a passwordless sign-in link. */
  sendSignInLink(email: string): void {
    this.store.dispatch(AuthActions.sendSignInLink({ email }));
  }

  signOut(): void {
    this.store.dispatch(AuthActions.signOut());
  }
}
