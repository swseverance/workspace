import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH } from '@org/firebase';
import { User } from 'firebase/auth';
import { Observable, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AUTH);
  const router = inject(Router);

  if (!auth) {
    return router.createUrlTree(['/login']);
  }

  return new Observable<User | null>((observer) =>
    auth.onAuthStateChanged((user) => observer.next(user)),
  ).pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/login']))),
  );
};
