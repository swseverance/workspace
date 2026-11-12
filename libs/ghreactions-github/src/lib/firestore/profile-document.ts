import type { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ProfileFields } from '../../models/profile';

/*
 * profiles/{lowercased username}: one document per tracked user, written by
 * the functions (trackTopUsers adds users, refreshProfile refreshes them) and
 * read by the site, which turns it into a Profile for the client.
 *
 * lastUpdated doubles as refreshProfile's queue: it refreshes the document
 * updated longest ago, and its write (or a touch, if the refresh fails) moves
 * that document to the back.
 */

/** A newly tracked user's document, before its first fetch from GitHub. */
export type WriteProfile = ProfileFields & {
  created: FieldValue;
  lastUpdated: FieldValue;
  lastFetched: null;
};

/**
 * A refresh's result, or just lastUpdated when a refresh fails. Never changes
 * username or created; always sets lastUpdated.
 */
export type UpdateProfile = Partial<
  Omit<ProfileFields, 'username'> & {
    lastFetched: FieldValue;
  }
> & {
  lastUpdated: FieldValue;
};

export type ReadProfile = ProfileFields & {
  created: Timestamp;
  lastUpdated: Timestamp;
  lastFetched: Timestamp | null;
};
