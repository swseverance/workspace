import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { COOKIE_AUTH_OPTIONS, CookieAuthOptions } from './auth-options';
import { provideSsrHttp } from './http/provide-http-client';
import { AuthEffects } from './store/auth.effects';
import { authFeature } from './store/auth.feature';
import { EmailLinkEffects } from './store/email-link.effects';
import { SessionEndedEffects } from './store/session-ended.effects';
import { SignInEffects } from './store/sign-in.effects';
import { SignOutEffects } from './store/sign-out.effects';

/**
 * For apps with cookie sessions: what provideNoAuth() sets up, with SSR-time
 * API calls forwarding the user's Cookie, plus the auth state and effects.
 * Needs provideStore() and provideEffects() earlier at the root.
 */
export function provideCookieAuth(
  options: CookieAuthOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: COOKIE_AUTH_OPTIONS, useValue: options },
    provideSsrHttp({ forwardCookie: true }),
    provideState(authFeature),
    provideEffects(
      AuthEffects,
      SignInEffects,
      SignOutEffects,
      SessionEndedEffects,
    ),
    options.emailLink ? provideEffects(EmailLinkEffects) : [],
    // ng-zorro only provides this through NzModalModule.
    NzModalService,
  ]);
}
