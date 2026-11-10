import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Provider } from '@angular/core';
import { ActionReducer, META_REDUCERS } from '@ngrx/store';
import { ENVIRONMENT } from '@org/environment';

const STYLE =
  'background: #ffd6f6; color: #7b1fa2; font-weight: bold; border-radius: 3px;';

/**
 * Logs every action in the browser, except in prod. Resolved once at injector
 * construction via META_REDUCERS rather than checked on every dispatched
 * action. On the server (including ng build's internal prerender pass) it's a
 * plain identity function, so console.log never runs there and can't break App
 * Hosting's build adapter, which expects clean JSON on ng build's stdout.
 */
export function provideLogMetaReducer(): Provider {
  return {
    provide: META_REDUCERS,
    multi: true,
    useFactory: () => {
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
      const isProd = inject(ENVIRONMENT).name === 'prod';

      if (!isBrowser || isProd) {
        return <T>(reducer: ActionReducer<T>) => reducer;
      }

      return <T>(reducer: ActionReducer<T>): ActionReducer<T> =>
        (state, action) => {
          const { type, ...payload } = action;
          console.log('%c %s ', STYLE, type, payload);

          return reducer(state, action);
        };
    },
  };
}
