import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { getToken } from 'firebase/app-check';
import { from, switchMap } from 'rxjs';
import { FIREBASE_APP_CHECK } from './index';

export const recaptchaInterceptor: HttpInterceptorFn = (req, next) => {
  const appCheck = inject(FIREBASE_APP_CHECK);

  if (!appCheck) {
    return next(req);
  }

  return from(getToken(appCheck)).pipe(
    switchMap(({ token }) =>
      next(req.clone({ setHeaders: { 'X-Firebase-AppCheck': token } })),
    ),
  );
};
