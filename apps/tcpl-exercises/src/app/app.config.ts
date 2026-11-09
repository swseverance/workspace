import { registerLocaleData } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import en from '@angular/common/locales/en';
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
import {
  GithubOutline,
  LoginOutline,
  LogoutOutline,
  MoonOutline,
  SunOutline,
} from '@ant-design/icons-angular/icons';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import {
  absoluteUrlInterceptor,
  forwardCookieInterceptor,
  provideAppCheckBackend,
  provideAuth,
} from '@org/auth';
import { provideEnvironment } from '@org/environment';
import { provideTheme } from '@org/theme';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import { AnalyticsEffects } from './store/analytics/analytics.effects';
import { analyticsReducer } from './store/analytics/analytics.reducer';
import { ChaptersEffects } from './store/exercise/chapters.effects';
import { ExerciseEffects } from './store/exercise/exercise.effects';
import { exerciseReducer } from './store/exercise/exercise.reducer';
import { SubmissionEffects } from './store/exercise/submission.effects';
import { provideLogMetaReducer } from './store/log.meta-reducer';

registerLocaleData(en);

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
    provideNzI18n(en_US),
    provideNzDateFnsAdapter(),
    provideNzIcons([
      GithubOutline,
      LoginOutline,
      LogoutOutline,
      MoonOutline,
      SunOutline,
    ]),
    provideStore(),
    provideLogMetaReducer(),
    provideEffects(),
    provideAuth(),
    provideState('exercise', exerciseReducer),
    provideEffects(ExerciseEffects, ChaptersEffects, SubmissionEffects),
    provideState('analytics', analyticsReducer),
    provideEffects(AnalyticsEffects),
  ],
};
