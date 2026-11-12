import { Profile, ProfileCounts, ReadProfile } from '@org/ghreactions-github';
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

  /** Every found profile's username and counts, without the rows. */
  async summaries(): Promise<{ username: string; counts: ProfileCounts }[]> {
    const snapshot = await collection()
      .where('status', '==', 'ok')
      .select('username', 'counts')
      .get();
    return snapshot.docs.map(
      (doc) => doc.data() as { username: string; counts: ProfileCounts },
    );
  },
};

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
