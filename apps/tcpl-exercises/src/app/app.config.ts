import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEnvironment } from '@org/environment';
import { provideTheme } from '@org/theme';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
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
  ],
};
