import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideSsrTransferCacheOrigins } from '@org/auth/http';
import { provideRequestEnvironmentAttribute } from '@org/environment';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideRequestEnvironmentAttribute(),
    provideSsrTransferCacheOrigins(),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
