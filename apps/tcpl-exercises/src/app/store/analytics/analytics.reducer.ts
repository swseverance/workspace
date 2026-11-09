import { createReducer, on } from '@ngrx/store';
import {
  analyticsLoaded,
  loadAnalytics,
  loadAnalyticsFailed,
} from './analytics.actions';
import { initialAnalyticsState } from './analytics.state';

export const analyticsReducer = createReducer(
  initialAnalyticsState,

  on(loadAnalytics, (state) => ({ ...state, loading: true })),

  on(analyticsLoaded, (state, { analytics }) => ({
    ...state,
    analytics,
    loading: false,
  })),

  on(loadAnalyticsFailed, (state) => ({ ...state, loading: false })),
);
