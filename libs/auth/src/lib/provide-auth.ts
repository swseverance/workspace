import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { provideSsrHttp } from './http/provide-http-client';
import { AuthEffects } from './store/auth.effects';
import { authFeature } from './store/auth.feature';
import { SessionEndedEffects } from './store/session-ended.effects';
import { SignInEffects } from './store/sign-in.effects';
import { SignOutEffects } from './store/sign-out.effects';

/**
 * For apps with cookie sessions: what provideNoAuth() sets up, with SSR-time
 * API calls forwarding the user's Cookie, plus the auth state and effects.
 * Needs provideStore() and provideEffects() earlier at the root.
 */
export function provideCookieAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideSsrHttp({ forwardCookie: true }),
    provideState(authFeature),
    provideEffects(
      AuthEffects,
      SignInEffects,
      SignOutEffects,
      SessionEndedEffects,
    ),
    // ng-zorro only provides this through NzModalModule.
    NzModalService,
  ]);
}
