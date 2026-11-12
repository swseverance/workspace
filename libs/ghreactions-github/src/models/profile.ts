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
 * A profile as the client gets it (GET /api/profile/:username): the stored
 * document with its timestamps as ISO strings.
 */
export type Profile = ProfileFields & {
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
>;

/** GET /api/users?page=N */
export type UsersPage = {
  users: UserSummary[];
  /** 1-based. */
  page: number;
  pageCount: number;
};
