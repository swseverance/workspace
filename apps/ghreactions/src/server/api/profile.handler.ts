import { Profile, TRACKED_USERS } from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ProfileResponse } from '../../models/profile';

// An object, so specs can replace the read.
export const profiles = {
  /** The profile refreshProfile last wrote, if any. */
  async get(username: string): Promise<Profile | undefined> {
    const snapshot = await getFirestore()
      .doc(`profiles/${username.toLowerCase()}`)
      .get();
    return snapshot.data() as Profile | undefined;
  },
};

export const profileHandler: RequestHandler = async (req, res) => {
  const requested = String(req.params['username']).toLowerCase();
  const username = TRACKED_USERS.find((u) => u.toLowerCase() === requested);

  if (!username) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  try {
    const profile = await profiles.get(username);

    if (profile?.status !== 'ok') {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const reacted = (rows: Profile['issues']) =>
      rows.filter((r) => r.total > 0);
    const body: ProfileResponse = {
      username,
      refreshedAt: profile.refreshedAt,
      issues: reacted(profile.issues),
      pullRequests: reacted(profile.pullRequests),
      issueComments: reacted(profile.issueComments),
    };
    res.json(body);
  } catch (err) {
    logger.error('[profile]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};
