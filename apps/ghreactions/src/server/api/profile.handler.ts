import { Profile, ProfileCounts } from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ProfileResponse } from '../../models/profile';

const collection = () => getFirestore().collection('profiles');

// An object, so specs can replace the reads.
export const profiles = {
  /** The profile refreshProfile last wrote, if any. */
  async get(username: string): Promise<Profile | undefined> {
    const snapshot = await collection().doc(username.toLowerCase()).get();
    return snapshot.data() as Profile | undefined;
  },

  /** Every found profile's username and counts, without the rows. */
  async summaries(): Promise<Pick<Profile, 'username' | 'counts'>[]> {
    const snapshot = await collection()
      .where('status', '==', 'ok')
      .select('username', 'counts')
      .get();
    return snapshot.docs.map(
      (doc) => doc.data() as { username: string; counts: ProfileCounts },
    );
  },
};

export const profileHandler: RequestHandler = async (req, res) => {
  try {
    const profile = await profiles.get(String(req.params['username']));

    // Anyone without a profile, including users GitHub doesn't know.
    if (profile?.status !== 'ok') {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const body: ProfileResponse = {
      username: profile.username,
      refreshedAt: profile.refreshedAt,
      issues: profile.issues,
      pullRequests: profile.pullRequests,
      issueComments: profile.issueComments,
    };
    res.json(body);
  } catch (err) {
    logger.error('[profile]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};
