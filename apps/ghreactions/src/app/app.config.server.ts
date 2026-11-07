import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideRequestEnvironmentAttribute } from '@org/environment';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideRequestEnvironmentAttribute(),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
