import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { EditOutline, PlusOutline } from '@ant-design/icons-angular/icons';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideCookieAuth } from '@org/auth';
import { provideEnvironment } from '@org/environment';
import { provideLogMetaReducer } from '@org/logger';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // No app-level loader beside the outlet: hydration keeps the server's page
    // in place until the lazy route loads and claims it, and a loader shown
    // meanwhile would sit on top of it. (Blocking initial navigation isn't an
    // option: Angular rejects it alongside hydration, NG05001.)
    provideRouter(appRoutes),
    provideEnvironment(environment),
    provideStore(),
    provideLogMetaReducer(),
    provideEffects(),
    provideCookieAuth(),
    provideNzI18n(en_US),
    provideNzDateFnsAdapter(),
    provideNzIcons([EditOutline, PlusOutline]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
