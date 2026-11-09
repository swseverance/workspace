import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnalyticsState } from './analytics.state';

export const selectAnalyticsState =
  createFeatureSelector<AnalyticsState>('analytics');

export const selectAnalytics = createSelector(
  selectAnalyticsState,
  (state) => state.analytics,
);
