import { GHReactionsRow } from './table';

/** A number for each of a profile's lists. */
export type ProfileCounts = {
  issues: number;
  pullRequests: number;
  issueComments: number;
};

/**
 * pending: tracked but not refreshed yet. not_found: GitHub doesn't know the
 * user (anymore).
 */
export type ProfileStatus = 'pending' | 'ok' | 'not_found';

/**
 * The fields every profile has, wherever it is: what fetchProfile returns,
 * and the core of the stored document and the client's Profile. Lists hold
 * only rows with at least one reaction, most reactions first; empty until the
 * first refresh.
 */
export type ProfileFields = {
  username: string;
  status: ProfileStatus;
  /** From the top 100 by total reactions. */
  issues: GHReactionsRow[];
  /** From the top 100 by total reactions. */
  pullRequests: GHReactionsRow[];
  /** From the 100 most recently updated. */
  issueComments: GHReactionsRow[];
  /** The lists' lengths, so the sitemap can read them without the rows. */
  counts: ProfileCounts;
  /** Reactions summed over each list's rows. */
  reactions: ProfileCounts;
  /**
   * Reactions across every row in the lists, which ranks users on /users.
   * Covers top items only, not everything the user has posted.
   */
  totalReactions: number;
};

/**
 * How long a snapshot someone asked for is kept. After that Firestore deletes
 * it, and it can be asked for again. Ranked users' snapshots never expire.
 */
export const REQUESTED_SNAPSHOT_DAYS = 30;

/**
 * A profile as the client gets it (GET /api/profile/:username): the stored
 * document with its timestamps as ISO strings.
 */
export type Profile = ProfileFields & {
  /**
   * True for GitHub's most-followed users, who are listed on /users. False
   * for a snapshot someone asked for: never listed, and kept for
   * REQUESTED_SNAPSHOT_DAYS.
   */
  ranked: boolean;
  /** When the user started being tracked. */
  created: string;
  /** The last write of any kind. */
  lastUpdated: string;
  /** The last successful fetch from GitHub; null until the first. */
  lastFetched: string | null;
};

/**
 * Users below this many reactions are left out of /users and the sitemap,
 * and their pages are noindex: too thin to be worth a search result. Many of
 * the most-followed users file few issues or PRs.
 */
export const MIN_INDEXED_REACTIONS = 50;

/** One row of /users. */
export type UserSummary = Pick<
  ProfileFields,
  'username' | 'counts' | 'reactions' | 'totalReactions'
> & {
  /** Place among the ranked users, from 1; the same in filtered results. */
  rank: number;
};

/** GET /api/users?page=N, or ?q=PREFIX (always a single page). */
export type UsersPage = {
  users: UserSummary[];
  /** 1-based. */
  page: number;
  pageCount: number;
};
