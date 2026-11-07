import { inject, InjectionToken, REQUEST_CONTEXT } from '@angular/core';

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

/**
 * Shape of the second argument passed to `angularApp.handle(req, context)` in
 * each app's server.ts — surfaced here via Angular's own REQUEST_CONTEXT.
 */
export type RequestContext = {
  environmentName: EnvironmentName;
};

/** The environment name the current request is being served from, or null outside SSR (e.g. in the browser, or in unit tests). */
export const REQUEST_ENVIRONMENT_NAME =
  new InjectionToken<EnvironmentName | null>('REQUEST_ENVIRONMENT_NAME', {
    providedIn: 'root',
    factory: () =>
      (inject(REQUEST_CONTEXT, { optional: true }) as RequestContext | null)
        ?.environmentName ?? null,
  });
