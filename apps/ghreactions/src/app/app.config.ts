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
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  GithubOutline,
  MoonOutline,
  SunOutline,
} from '@ant-design/icons-angular/icons';
import { ENVIRONMENT } from '@org/environment';
import { recaptchaInterceptor } from '@org/firebase';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

ModuleRegistry.registerModules([AllCommunityModule]);

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptors([recaptchaInterceptor])),
    { provide: ENVIRONMENT, useValue: environment },
    provideNzI18n(en_US),
    provideNzIcons([GithubOutline, MoonOutline, SunOutline]),
  ],
};
