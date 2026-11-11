import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { absoluteUrlInterceptor } from './absolute-url.interceptor';
import { provideAppCheckBackend } from './app-check.backend';
import { ssrLoopbackInterceptor } from './forward-cookie.interceptor';

/**
 * Hydration and HttpClient for server-rendered apps: SSR-time API calls stay
 * in this process (optionally carrying the user's Cookie), the browser reuses
 * their responses through the transfer cache, and same-origin requests that
 * reach the network get an App Check token. Pair with
 * provideSsrTransferCacheOrigins() in the server config.
 */
export function provideSsrHttp({
  forwardCookie,
}: {
  forwardCookie: boolean;
}): EnvironmentProviders {
  return makeEnvironmentProviders([
    // includeRequestsWithAuthHeaders: a forwarded Cookie header would
    // otherwise stop the transfer cache from storing the response.
    // includeNonCacheableRequests: /api responds with Cache-Control:
    // no-store, which the transfer cache otherwise also treats as an opt-out.
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
        includeNonCacheableRequests: true,
      }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        ssrLoopbackInterceptor({ forwardCookie }),
        absoluteUrlInterceptor,
      ]),
    ),
    // Must come after provideHttpClient so it overrides withFetch()'s backend.
    provideAppCheckBackend(),
  ]);
}

/** For apps without sign-in: hydration, HttpClient and App Check. */
export function provideNoAuth(): EnvironmentProviders {
  return provideSsrHttp({ forwardCookie: false });
}
