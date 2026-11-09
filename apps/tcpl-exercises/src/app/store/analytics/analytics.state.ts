import { AnalyticsResponseBody } from '../../../shared/models';

export interface AnalyticsState {
  /** Null until loaded, and if loading failed. */
  analytics: AnalyticsResponseBody | null;

  loading: boolean;
}

export const initialAnalyticsState: AnalyticsState = {
  analytics: null,
  loading: false,
};
