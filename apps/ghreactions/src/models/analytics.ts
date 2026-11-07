export type AnalyticsResponse = {
  /** First-page searches; scrolling through results doesn't count again. */
  searches: number;
  /** Distinct GitHub usernames searched (approximate). */
  profiles: number;
};
