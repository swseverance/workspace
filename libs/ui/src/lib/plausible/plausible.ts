import { isPlatformBrowser } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { ENVIRONMENT } from '@org/environment';

export type PlausibleConfig = {
  /** The site's domain as set up in Plausible, e.g. 'ghreactions.io'. */
  domain: string;
};

/**
 * Counts page views with Plausible (cookieless), including navigation
 * inside the app. Prod only, so dev and local visits never reach the
 * dashboard, and browser only: the tracker doesn't work during SSR.
 * Needs provideEnvironment() earlier at the root.
 */
export function providePlausible(
  config: PlausibleConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
      if (inject(ENVIRONMENT).name !== 'prod') return;

      // A lazy chunk, fetched only here: never on the server, never outside
      // prod. Not awaited: analytics shouldn't delay startup.
      void import('@plausible-analytics/tracker').then(({ init }) =>
        init({ domain: config.domain }),
      );
    }),
  ]);
}
