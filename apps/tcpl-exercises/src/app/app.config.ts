import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  CheckOutline,
  CopyOutline,
  GithubOutline,
  LoginOutline,
  LogoutOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  MoonOutline,
  SunOutline,
} from '@ant-design/icons-angular/icons';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideCookieAuth } from '@org/auth';
import { provideEnvironment } from '@org/environment';
import { provideLogMetaReducer } from '@org/logger';
import { provideTheme } from '@org/theme';
import { providePlausible, provideSeo } from '@org/ui';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import { ChaptersEffects } from './store/exercise/chapters.effects';
import { DraftEffects } from './store/exercise/draft.effects';
import { ExerciseEffects } from './store/exercise/exercise.effects';
import { exerciseReducer } from './store/exercise/exercise.reducer';
import { SubmissionEffects } from './store/exercise/submission.effects';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideEnvironment(environment),
    provideSeo({ siteName: 'K&R Exercises' }),
    providePlausible({ domain: 'kandrexercises.com' }),
    provideTheme({
      storageKey: 'tcpl-exercises-theme',
      classes: {
        light: 'tcpl-exercises-light-theme',
        dark: 'tcpl-exercises-dark-theme',
      },
    }),
    provideNzConfig({
      message: { nzMaxStack: 1 },
    }),
    provideNzI18n(en_US),
    provideNzDateFnsAdapter(),
    provideNzIcons([
      CheckOutline,
      CopyOutline,
      GithubOutline,
      LoginOutline,
      LogoutOutline,
      MenuFoldOutline,
      MenuUnfoldOutline,
      MoonOutline,
      SunOutline,
    ]),
    provideStore(),
    provideLogMetaReducer(),
    provideEffects(),
    provideCookieAuth({ emailLink: true }),
    provideState('exercise', exerciseReducer),
    provideEffects(
      ExerciseEffects,
      ChaptersEffects,
      SubmissionEffects,
      DraftEffects,
    ),
  ],
};
