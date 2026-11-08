import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { authFeature } from '@org/auth';
import { filter, map, take } from 'rxjs';

/**
 * Waits for the session to be known, then lets signed-in users through. Runs
 * during SSR too (the session comes from the forwarded cookie), so a
 * signed-out visitor is redirected before any page is rendered.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return inject(Store)
    .select(authFeature.selectAuthState)
    .pipe(
      // Still being decided; noSession is final enough to redirect on, since
      // the API would reject this user's calls.
      filter(({ status }) => status !== 'unknown' && status !== 'signingIn'),
      take(1),
      map(({ status }) =>
        status === 'signedIn' ? true : router.createUrlTree(['/login']),
      ),
    );
};
