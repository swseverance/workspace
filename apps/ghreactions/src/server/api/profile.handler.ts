import {
  MIN_INDEXED_REACTIONS,
  Profile,
  ProfileCounts,
  ReadProfile,
  UserSummary,
} from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const collection = () => getFirestore().collection('profiles');

// An object, so specs can replace the reads.
export const profiles = {
  /** The stored profile, if the user is tracked. */
  async get(username: string): Promise<ReadProfile | undefined> {
    const snapshot = await collection().doc(username.toLowerCase()).get();
    return snapshot.data() as ReadProfile | undefined;
  },

  /** Every indexed user's username and counts, without the rows. */
  async summaries(): Promise<{ username: string; counts: ProfileCounts }[]> {
    const snapshot = await ranked().select('username', 'counts').get();
    return snapshot.docs.map(
      (doc) => doc.data() as { username: string; counts: ProfileCounts },
    );
  },

  /**
   * Indexed users (at least MIN_INDEXED_REACTIONS), most reactions first.
   * Only found, refreshed profiles have reactions, so this needs no status
   * filter (and so no composite index).
   */
  async ranked(offset: number, limit: number): Promise<UserSummary[]> {
    const snapshot = await ranked()
      .orderBy('totalReactions', 'desc')
      .select('username', 'counts', 'reactions', 'totalReactions')
      .offset(offset)
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as UserSummary);
  },

  /** How many users ranked() can return in all. */
  async rankedCount(): Promise<number> {
    const snapshot = await ranked().count().get();
    return snapshot.data().count;
  },
};

const ranked = () =>
  collection().where('totalReactions', '>=', MIN_INDEXED_REACTIONS);

/** The stored document as the client gets it: timestamps as ISO strings. */
export function toProfile({
  created,
  lastUpdated,
  lastFetched,
  ...fields
}: ReadProfile): Profile {
  return {
    ...fields,
    created: created.toDate().toISOString(),
    lastUpdated: lastUpdated.toDate().toISOString(),
    lastFetched: lastFetched?.toDate().toISOString() ?? null,
  };
}

export const profileHandler: RequestHandler = async (req, res) => {
  try {
    const profile = await profiles.get(String(req.params['username']));

    // Untracked, not refreshed yet, or unknown to GitHub.
    if (profile?.status !== 'ok') {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.json(toProfile(profile));
  } catch (err) {
    logger.error('[profile]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};
