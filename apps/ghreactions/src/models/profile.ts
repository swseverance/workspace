import { GHReactionsRow } from '@org/ghreactions-github/models';

/** GET /api/profile/:username. Rows are only those with reactions. */
export type ProfileResponse = {
  /** The tracked spelling, e.g. JakeWharton for /u/jakewharton. */
  username: string;
  /** ISO timestamp of the refresh that produced this snapshot. */
  refreshedAt: string;
  /** Top by total reactions. */
  issues: GHReactionsRow[];
  /** Top by total reactions. */
  pullRequests: GHReactionsRow[];
  /** Among the 100 most recently updated, by total reactions. */
  issueComments: GHReactionsRow[];
};
