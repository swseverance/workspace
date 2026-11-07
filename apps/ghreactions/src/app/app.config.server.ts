import {
  ApplicationConfig,
  DOCUMENT,
  inject,
  mergeApplicationConfig,
} from '@angular/core';
import { BEFORE_APP_SERIALIZED } from '@angular/platform-server';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { REQUEST_ENVIRONMENT_NAME } from '@org/environment';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: BEFORE_APP_SERIALIZED,
      multi: true,
      useFactory: () => {
        const document = inject(DOCUMENT);
        const environmentName = inject(REQUEST_ENVIRONMENT_NAME);

        return () => {
          if (environmentName) {
            document.documentElement.setAttribute(
              'data-server',
              environmentName,
            );
          }
        };
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
