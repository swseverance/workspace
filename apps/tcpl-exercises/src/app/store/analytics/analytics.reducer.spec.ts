import {
  analyticsLoaded,
  loadAnalytics,
  loadAnalyticsFailed,
} from './analytics.actions';
import { analyticsReducer } from './analytics.reducer';
import { initialAnalyticsState } from './analytics.state';

const ANALYTICS = { submissions: 1000, users: 400 };

describe('analyticsReducer', () => {
  it('marks analytics as loading', () => {
    expect(analyticsReducer(initialAnalyticsState, loadAnalytics())).toEqual({
      analytics: null,
      loading: true,
    });
  });

  it('stores loaded analytics', () => {
    const loading = { ...initialAnalyticsState, loading: true };

    expect(
      analyticsReducer(loading, analyticsLoaded({ analytics: ANALYTICS })),
    ).toEqual({ analytics: ANALYTICS, loading: false });
  });

  it('keeps the previous analytics when a load fails', () => {
    const loading = { analytics: ANALYTICS, loading: true };

    expect(
      analyticsReducer(loading, loadAnalyticsFailed({ error: new Error() })),
    ).toEqual({ analytics: ANALYTICS, loading: false });
  });
});
