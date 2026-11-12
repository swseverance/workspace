import { GHReactionsRow } from './table';

/** How many rows each list holds. */
export type ProfileCounts = {
  issues: number;
  pullRequests: number;
  issueComments: number;
};

/**
 * A tracked user's snapshot, stored at profiles/{lowercased username}. Lists
 * hold only rows with at least one reaction, most reactions first.
 */
export type Profile = {
  username: string;
  /** ISO timestamp of the refresh that produced this snapshot. */
  refreshedAt: string;
  status: 'ok' | 'not_found';
  /** From the top 100 by total reactions. */
  issues: GHReactionsRow[];
  /** From the top 100 by total reactions. */
  pullRequests: GHReactionsRow[];
  /** From the 100 most recently updated. */
  issueComments: GHReactionsRow[];
  /** The lists' lengths, so the sitemap can read them without the rows. */
  counts: ProfileCounts;
};
