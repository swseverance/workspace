import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Logger } from '@org/logger';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { AnalyticsService } from '../../services/analytics-service';
import {
  analyticsLoaded,
  loadAnalytics,
  loadAnalyticsFailed,
} from './analytics.actions';
import { AnalyticsEffects } from './analytics.effects';

function setup(getStats: AnalyticsService['getStats']) {
  const actions$: Observable<Action> = of(loadAnalytics());

  TestBed.configureTestingModule({
    providers: [
      AnalyticsEffects,
      provideMockActions(() => actions$),
      { provide: AnalyticsService, useValue: { getStats } },
      { provide: Logger, useValue: {} },
    ],
  });

  return TestBed.inject(AnalyticsEffects);
}

describe('AnalyticsEffects.loadAnalytics$', () => {
  it('loads the stats', async () => {
    const analytics = { submissions: 1000, users: 400 };
    const effects = setup(() => of(analytics));

    await expect(firstValueFrom(effects.loadAnalytics$)).resolves.toEqual(
      analyticsLoaded({ analytics }),
    );
  });

  it('reports a failed load', async () => {
    const error = new Error('offline');
    const effects = setup(() => throwError(() => error));

    await expect(firstValueFrom(effects.loadAnalytics$)).resolves.toEqual(
      loadAnalyticsFailed({ error }),
    );
  });
});
