import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import {
  absoluteUrlInterceptor,
  forwardCookieInterceptor,
  provideAppCheckBackend,
  provideAuth,
} from '@org/auth';
import { provideEnvironment } from '@org/environment';
import { provideTheme } from '@org/theme';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // includeRequestsWithAuthHeaders: forwardCookieInterceptor attaches a
    // Cookie header to SSR-time API calls, which the transfer cache
    // otherwise refuses to store at all.
    // includeNonCacheableRequests: /api responds with Cache-Control:
    // no-store (meant for real HTTP caches and CDNs), which the transfer
    // cache otherwise also treats as an opt-out of its SSR-to-hydration
    // handoff.
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
        includeNonCacheableRequests: true,
      }),
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideEnvironment(environment),
    provideTheme({
      storageKey: 'tcpl-exercises-theme',
      classes: {
        light: 'tcpl-exercises-light-theme',
        dark: 'tcpl-exercises-dark-theme',
      },
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([forwardCookieInterceptor, absoluteUrlInterceptor]),
    ),
    // Must come after provideHttpClient so it overrides withFetch()'s backend.
    provideAppCheckBackend(),
    provideStore(),
    provideEffects(),
    provideAuth(),
  ],
};
