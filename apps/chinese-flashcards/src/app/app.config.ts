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
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import {
  DeleteOutline,
  EditOutline,
  LeftCircleTwoTone,
  LeftOutline,
  SearchOutline,
} from '@ant-design/icons-angular/icons';
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
    // No app-level loader beside the outlet: hydration keeps the server's page
    // in place until the lazy route loads and claims it, and a loader shown
    // meanwhile would sit on top of it. (Blocking initial navigation isn't an
    // option: Angular rejects it alongside hydration, NG05001.)
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([forwardCookieInterceptor, absoluteUrlInterceptor]),
    ),
    // Must come after provideHttpClient so it overrides withFetch()'s backend.
    provideAppCheckBackend(),
    provideStore(),
    provideEffects(),
    provideAuth(),
    provideEnvironment(environment),
    provideNzI18n(en_US),
    provideNzDateFnsAdapter(),
    provideNzIcons([
      LeftOutline,
      LeftCircleTwoTone,
      EditOutline,
      DeleteOutline,
      SearchOutline,
    ]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
