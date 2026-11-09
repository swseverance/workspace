import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Provider } from '@angular/core';
import { ActionReducer, META_REDUCERS } from '@ngrx/store';
import { ENVIRONMENT } from '@org/environment';

const STYLE =
  'background: #ffd6f6; color: #7b1fa2; font-weight: bold; border-radius: 3px;';

/**
 * Always active in the browser, in every environment; prod just trims what
 * it logs (see below). Resolved once at injector construction via
 * META_REDUCERS rather than checking the platform on every dispatched
 * action — on the server (including ng build's internal prerender pass)
 * this becomes a plain identity function, so console.log never runs there
 * and can't break App Hosting's build adapter, which expects clean JSON on
 * ng build's stdout.
 */
export function provideLogMetaReducer(): Provider {
  return {
    provide: META_REDUCERS,
    multi: true,
    useFactory: () => {
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
      const isProd = inject(ENVIRONMENT).name === 'prod';

      if (!isBrowser) {
        return <T>(reducer: ActionReducer<T>) => reducer;
      }

      return <T>(reducer: ActionReducer<T>): ActionReducer<T> =>
        (state, action) => {
          const nextState = reducer(state, action);

          if (isProd) {
            // Prod still logs every action, just without the payload/nextState
            // dump — enough to see what happened without leaking user data or
            // record shapes to the browser console in production.
            console.log('%c %s ', STYLE, action.type);
          } else {
            const { type, ...payload } = action;
            console.log('%c %s ', STYLE, type, payload, nextState);
          }

          return nextState;
        };
    },
  };
}
