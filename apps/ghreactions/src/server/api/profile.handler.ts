import {
  MIN_INDEXED_REACTIONS,
  Profile,
  profileApi,
  ProfileFields,
  rateLimit,
  RateLimitError,
  ReadProfile,
  REQUESTED_SNAPSHOT_DAYS,
  UserSummary,
  WriteProfile,
} from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler, Response } from 'express';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { snapshotQuota } from './snapshot-quota';

/** A whole GitHub username (any case). */
export const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d-]{0,38})$/i;

const collection = () => getFirestore().collection('profiles');
const document = (username: string) => collection().doc(username.toLowerCase());

// The ranking changes as refreshProfile works through the users, one a
// minute, so a few minutes old is as good as fresh.
const RANKING_TTL_MS = 5 * 60 * 1000;
let ranking: { at: number; users: Promise<UserSummary[]> } | undefined;

// gRPC's ALREADY_EXISTS, which create() fails with.
const ALREADY_EXISTS = 6;

// An object, so specs can replace the reads and writes.
export const profiles = {
  /** The stored profile, if there is one. */
  async get(username: string): Promise<ReadProfile | undefined> {
    const snapshot = await document(username).get();
    return snapshot.data() as ReadProfile | undefined;
  },

  /**
   * Every ranked user with at least MIN_INDEXED_REACTIONS, most reactions
   * first: the whole of /users, which pages, filters and the sitemap all
   * take slices of. Only found, refreshed profiles have reactions, so this
   * needs no status filter.
   *
   * Read in one go and kept for a few minutes rather than paged in Firestore.
   * Leaving out the unranked snapshots there would need a composite index
   * and the flag on every existing document; here a missing flag just counts
   * as ranked. It also costs fewer reads than offset paging, which pays for
   * every row it skips.
   */
  ranked(): Promise<UserSummary[]> {
    if (!ranking || Date.now() - ranking.at > RANKING_TTL_MS) {
      const users = readRanking();
      ranking = { at: Date.now(), users };
      // A failed read isn't kept: the next call tries again.
      users.catch(() => {
        if (ranking?.users === users) ranking = undefined;
      });
    }
    return ranking.users;
  },

  /**
   * Stores a snapshot the site has just fetched. For someone new it becomes
   * an unranked document that expires. If the document already exists (a
   * ranked user not refreshed yet, or two requests at once), only the fetched
   * fields are written, as refreshProfile would.
   */
  async store({ username, ...fields }: ProfileFields): Promise<void> {
    const fetched = {
      lastFetched: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp(),
    };

    try {
      await document(username).create({
        username,
        ...fields,
        ...fetched,
        ranked: false,
        created: FieldValue.serverTimestamp(),
        expireAt: Timestamp.fromMillis(
          Date.now() + REQUESTED_SNAPSHOT_DAYS * 24 * 60 * 60 * 1000,
        ),
      } satisfies WriteProfile);
    } catch (err) {
      if ((err as { code?: unknown }).code !== ALREADY_EXISTS) throw err;
      await document(username).update({ ...fields, ...fetched });
    }
  },
};

async function readRanking(): Promise<UserSummary[]> {
  const snapshot = await collection()
    .where('totalReactions', '>=', MIN_INDEXED_REACTIONS)
    .select('username', 'counts', 'reactions', 'totalReactions', 'ranked')
    .get();

  return (
    snapshot.docs
      .map(
        (doc) => doc.data() as Omit<UserSummary, 'rank'> & { ranked?: boolean },
      )
      .filter((user) => user.ranked !== false)
      // By username within a tie, so ranks don't shuffle between reads.
      .sort(
        (a, b) =>
          b.totalReactions - a.totalReactions ||
          a.username.localeCompare(b.username),
      )
      .map(({ ranked: _ranked, ...user }, index) => ({
        ...user,
        rank: index + 1,
      }))
  );
}

/** The stored document as the client gets it: timestamps as ISO strings. */
export function toProfile({
  created,
  lastUpdated,
  lastFetched,
  ranked,
  expireAt: _expireAt,
  ...fields
}: ReadProfile): Profile {
  return {
    ...fields,
    ranked: ranked !== false,
    created: created.toDate().toISOString(),
    lastUpdated: lastUpdated.toDate().toISOString(),
    lastFetched: lastFetched?.toDate().toISOString() ?? null,
  };
}

/** GET /api/profile/:username: the stored snapshot; never builds one. */
export const profileHandler: RequestHandler = async (req, res) => {
  try {
    const profile = await profiles.get(String(req.params['username']));

    // No snapshot, not refreshed yet, or unknown to GitHub.
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

/**
 * POST /api/profile/:username: the snapshot, built now if there isn't one.
 *
 * A separate, explicit request rather than something GET does, so that only
 * a visitor asking for a snapshot spends GitHub calls and stores a document:
 * a crawler walking /u/<anything> can't.
 */
export const buildProfileHandler: RequestHandler = async (req, res) => {
  const username = String(req.params['username']);
  if (!GITHUB_USERNAME.test(username)) {
    res.status(400).json({ message: 'Not a GitHub username' });
    return;
  }

  try {
    const existing = await profiles.get(username);
    if (existing?.status === 'ok') {
      res.json(toProfile(existing));
      return;
    }

    // Only someone new adds a document for refreshProfile to keep fresh.
    if (!existing && !(await snapshotQuota.take())) {
      res.status(429).json({
        message:
          "We've built as many new snapshots as we can today. Please try again tomorrow.",
      });
      return;
    }

    await rateLimit.checkRateLimit();
    const fetched = await profileApi.fetchProfile(username, { parallel: true });

    // Not stored: a typo shouldn't leave a document behind.
    if (fetched.status !== 'ok') {
      res.status(404).json({ message: 'GitHub has no user with that name.' });
      return;
    }

    await profiles.store(fetched);
    // Read back for the timestamps the server set.
    const stored = await profiles.get(username);
    res.json(toProfile(stored as ReadProfile));
  } catch (err) {
    if (err instanceof RateLimitError) {
      rateLimited(res, err);
      return;
    }

    logger.error('[profile] build', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};

function rateLimited(res: Response, err: RateLimitError): void {
  const seconds = Math.max(1, err.retryAt - Math.floor(Date.now() / 1000));
  const minutes = Math.ceil(seconds / 60);
  res
    .set('Retry-After', String(seconds))
    .status(429)
    .json({
      message: `GitHub's rate limit has been reached. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    });
}
