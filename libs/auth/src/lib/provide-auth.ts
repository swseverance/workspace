import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  REQUEST_CONTEXT,
} from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import type { SsrRequestContext } from '@org/server';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthEffects } from './store/auth.effects';
import { authFeature } from './store/auth.feature';

/**
 * Registers the auth feature state and effects. Needs `provideStore()` and
 * `provideEffects()` at the root, and the HTTP setup from the README so the
 * session survives server rendering.
 */
export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(authFeature),
    provideEffects(AuthEffects),
    // ng-zorro only provides this through NzModalModule.
    NzModalService,
  ]);
}

/**
 * Server config only (Angular throws if this token is provided in the
 * browser). forwardCookieInterceptor sends SSR-time API calls to the loopback
 * origin, while the browser's matching requests use the public origin
 * (absoluteUrlInterceptor). The transfer cache keys on the URL, so this maps
 * the two together for each render.
 */
export function provideSsrTransferCacheOrigins(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => {
        const context = inject(REQUEST_CONTEXT, {
          optional: true,
        }) as Partial<SsrRequestContext> | null;

        return context?.loopbackOrigin && context.publicOrigin
          ? { [context.loopbackOrigin]: context.publicOrigin }
          : {};
      },
    },
  ]);
}
