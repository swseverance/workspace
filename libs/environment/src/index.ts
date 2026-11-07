import {
  DOCUMENT,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  REQUEST_CONTEXT,
} from '@angular/core';
import { BEFORE_APP_SERIALIZED } from '@angular/platform-server';

export type EnvironmentName = 'prod' | 'dev' | 'local';

export type Environment = {
  name: EnvironmentName;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  reCAPTCHA: string;
};

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');

export function provideEnvironment(
  environment: Environment,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ENVIRONMENT, useValue: environment },
  ]);
}

/**
 * Shape of the second argument passed to `angularApp.handle(req, context)` in
 * each app's server.ts — surfaced here via Angular's own REQUEST_CONTEXT.
 */
export type RequestContext = {
  environmentName: EnvironmentName;
};

/**
 * Stamps `data-server="<environmentName>"` on the server-rendered
 * `<html>` element — an easy way to tell which environment actually
 * served a given response just by inspecting the DOM. Add to each
 * app's `app.config.server.ts` providers; it's a no-op outside SSR.
 */
export function provideRequestEnvironmentAttribute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: BEFORE_APP_SERIALIZED,
      multi: true,
      useFactory: () => {
        const document = inject(DOCUMENT);
        const environmentName = (
          inject(REQUEST_CONTEXT, { optional: true }) as RequestContext | null
        )?.environmentName;

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
  ]);
}
