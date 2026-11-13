import type { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ProfileFields } from '../../models/profile';

/*
 * profiles/{lowercased username}: one document per user with a snapshot.
 *
 * Ranked documents are GitHub's most-followed users: trackTopUsers adds
 * them, and they are listed on /users. Unranked documents are snapshots
 * someone asked for on the site, which builds them on the spot; they are
 * never listed, and Firestore deletes them at expireAt (a TTL policy on that
 * field, see firestore.indexes.json).
 *
 * refreshProfile refreshes both kinds the same way. lastUpdated doubles as
 * its queue: it refreshes the document updated longest ago, and its write
 * (or a touch, if the refresh fails) moves that document to the back.
 */

/** A new document: a ranked user before their first fetch, or a snapshot just built. */
export type WriteProfile = ProfileFields & {
  ranked: boolean;
  created: FieldValue;
  lastUpdated: FieldValue;
  lastFetched: FieldValue | null;
  /** Unranked documents only. */
  expireAt?: Timestamp;
};

/**
 * A refresh's result, or just lastUpdated when a refresh fails. Never changes
 * username, created, ranked or expireAt; always sets lastUpdated.
 */
export type UpdateProfile = Partial<
  Omit<ProfileFields, 'username'> & {
    lastFetched: FieldValue;
  }
> & {
  lastUpdated: FieldValue;
};

export type ReadProfile = ProfileFields & {
  /** Missing on documents written before unranked ones existed: ranked. */
  ranked?: boolean;
  created: Timestamp;
  lastUpdated: Timestamp;
  lastFetched: Timestamp | null;
  expireAt?: Timestamp;
};
