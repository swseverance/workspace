import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@org/logger';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AnalyticsService } from '../../services/analytics-service';
import {
  analyticsLoaded,
  loadAnalytics,
  loadAnalyticsFailed,
} from './analytics.actions';

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
