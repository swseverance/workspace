import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  CloseCircleFill,
  GithubOutline,
  MoonOutline,
  SunOutline,
} from '@ant-design/icons-angular/icons';
import { provideNoAuth } from '@org/auth/http';
import { provideEnvironment } from '@org/environment';
import { provideTheme } from '@org/theme';
import { providePlausible, provideSeo } from '@org/ui';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideNoAuth(),
    provideEnvironment(environment),
    provideSeo({ siteName: 'GitHub Reactions' }),
    providePlausible({ domain: 'ghreactions.io' }),
    provideNzI18n(en_US),
    // Dates render on the server too; UTC keeps its text and the browser's
    // the same, whatever the viewer's timezone.
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: 'UTC' } },
    provideNzIcons([CloseCircleFill, GithubOutline, MoonOutline, SunOutline]),
    provideTheme({
      storageKey: 'ghreactions-theme',
      classes: {
        light: 'ghreactions-light-theme',
        dark: 'ghreactions-dark-theme',
      },
    }),
  ],
};
