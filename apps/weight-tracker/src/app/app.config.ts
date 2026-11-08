import { registerLocaleData } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import en from '@angular/common/locales/en';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { EditOutline, PlusOutline } from '@ant-design/icons-angular/icons';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import {
  absoluteUrlInterceptor,
  forwardCookieInterceptor,
  provideAppCheckBackend,
  provideAuth,
} from '@org/auth';
import { provideEnvironment } from '@org/environment';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    // includeRequestsWithAuthHeaders: forwardCookieInterceptor attaches a
    // Cookie header to SSR-time API calls, which the transfer cache
    // otherwise refuses to store.
    // includeNonCacheableRequests: /api responds with Cache-Control:
    // no-store, which the transfer cache otherwise also treats as an opt-out.
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
        includeNonCacheableRequests: true,
      }),
    ),
    provideBrowserGlobalErrorListeners(),
    // Wait for the first route (lazy chunk, guard) before rendering, as the
    // server does, so hydration starts from the same page instead of an
    // empty outlet.
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideEnvironment(environment),
    provideHttpClient(
      withFetch(),
      withInterceptors([forwardCookieInterceptor, absoluteUrlInterceptor]),
    ),
    // Must come after provideHttpClient so it overrides withFetch()'s backend.
    provideAppCheckBackend(),
    provideStore(),
    provideEffects(),
    provideAuth(),
    provideNzI18n(en_US),
    provideNzDateFnsAdapter(),
    provideNzIcons([EditOutline, PlusOutline]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
