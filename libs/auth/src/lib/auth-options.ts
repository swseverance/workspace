import { InjectionToken } from '@angular/core';

export type CookieAuthOptions = {
  /**
   * Also offer passwordless sign-in by email (Firebase's email link). The
   * "Email link" sign-in method must be enabled in the Firebase project.
   */
  emailLink?: boolean;
};

export const COOKIE_AUTH_OPTIONS = new InjectionToken<CookieAuthOptions>(
  'COOKIE_AUTH_OPTIONS',
  { providedIn: 'root', factory: () => ({}) },
);
