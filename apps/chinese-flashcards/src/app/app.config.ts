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
import { provideEnvironment } from '@org/environment';
import { authInterceptor, recaptchaInterceptor } from '@org/firebase';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, recaptchaInterceptor]),
    ),
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
