import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@org/logger';
import { catchError, map, of, switchMap, tap, timeout } from 'rxjs';
import { AnalyticsService } from '../../services/analytics-service';
import {
  analyticsLoaded,
  loadAnalytics,
  loadAnalyticsFailed,
} from './analytics.actions';

/**
 * The page is server-rendered with the stats, so this caps how long it can
 * wait on them. Upstash retries with backoff when Redis is down, which
 * would otherwise hold up the home page for seconds.
 */
export const ANALYTICS_TIMEOUT_MS = 500;

@Injectable()
export class AnalyticsEffects {
  private actions$ = inject(Actions);
  private analytics = inject(AnalyticsService);
  private logger = inject(Logger);

  loadAnalytics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAnalytics),
      switchMap(() =>
        this.analytics.getStats().pipe(
          timeout(ANALYTICS_TIMEOUT_MS),
          map((analytics) => analyticsLoaded({ analytics })),
          catchError((error) => of(loadAnalyticsFailed({ error }))),
        ),
      ),
    ),
  );

  // No message for the user: the stats are a nicety, so the home page
  // just leaves them out.
  loadAnalyticsFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadAnalyticsFailed),
        tap(({ error }) =>
          this.logger.error('[analytics] load failed:', error),
        ),
      ),
    { dispatch: false },
  );
}
