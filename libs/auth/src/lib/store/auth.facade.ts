import { inject, Service } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { authFeature } from './auth.feature';

/** What components use: the signed-in user and the sign-in/out actions. */
@Service()
export class AuthFacade {
  private readonly store = inject(Store);

  readonly user$ = this.store.select(authFeature.selectUser);

  openSignInModal(): void {
    this.store.dispatch(AuthActions.openSignInModal());
  }

  signIn(): void {
    this.store.dispatch(AuthActions.signIn({ provider: 'google' }));
  }

  signOut(): void {
    this.store.dispatch(AuthActions.signOut());
  }
}
