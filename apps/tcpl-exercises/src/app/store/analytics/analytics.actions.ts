import { createAction, props } from '@ngrx/store';
import { AnalyticsResponseBody } from '../../../shared/models';

export const loadAnalytics = createAction('Load Analytics');

export const analyticsLoaded = createAction(
  'Analytics Loaded',
  props<{ analytics: AnalyticsResponseBody }>(),
);

export const loadAnalyticsFailed = createAction(
  'Load Analytics Failed',
  props<{ error: unknown }>(),
);
