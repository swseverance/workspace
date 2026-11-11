import { GHReactionsRow } from './table';

/** A tracked user's snapshot, stored at profiles/{lowercased username}. */
export type Profile = {
  username: string;
  /** ISO timestamp of the refresh that produced this snapshot. */
  refreshedAt: string;
  status: 'ok' | 'not_found';
  /** Top 100 by total reactions. */
  issues: GHReactionsRow[];
  /** Top 100 by total reactions. */
  pullRequests: GHReactionsRow[];
  /** The 100 most recently updated, sorted by total reactions. */
  issueComments: GHReactionsRow[];
  /** The 100 newest, sorted by total reactions. */
  commitComments: GHReactionsRow[];
};
