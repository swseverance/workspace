import { ReadProfile, REQUESTED_SNAPSHOT_DAYS } from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { GITHUB_USERNAME, profiles } from '../api/profile.handler';
import {
  CardData,
  CardTheme,
  POSITIVE_REACTIONS,
  renderCard,
  renderMissingCard,
} from './render-card';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Positive reactions to the user's issues and pull requests. Comments are
 * left out: the snapshot holds the most reacted issues and pull requests but
 * only the most recent comments, so their sum would say little.
 */
export function positiveCounts(
  profile: Pick<ReadProfile, 'issues' | 'pullRequests'>,
): CardData['counts'] {
  const rows = [...profile.issues, ...profile.pullRequests];

  return Object.fromEntries(
    POSITIVE_REACTIONS.map(({ content }) => [
      content,
      rows.reduce((sum, row) => sum + (row.reactions[content] ?? 0), 0),
    ]),
  ) as CardData['counts'];
}

/**
 * A card being shown means the snapshot is still wanted (it's in someone's
 * README), so push its expiry back out. Only once the expiry is a day closer
 * than a fresh one, which keeps this to one write a day per card.
 */
function shouldRenew({ ranked, expireAt }: ReadProfile): boolean {
  if (ranked !== false || !expireAt) return false;

  // What a renewal would set, less a day.
  const renewedYesterday = Date.now() + (REQUESTED_SNAPSHOT_DAYS - 1) * DAY_MS;

  return expireAt.toMillis() < renewedYesterday;
}

/**
 * GET /card/:username.svg: the card for a GitHub profile README. With
 * ?theme=light or ?theme=dark its colours are fixed; otherwise they follow
 * the viewer's system setting.
 *
 * Reads the stored snapshot and never builds one, like a page view. Always
 * an image, even with no snapshot: a README can only show an image.
 */
export const cardHandler: RequestHandler = async (req, res) => {
  const match = /^(.+)\.svg$/.exec(String(req.params['file']));
  const username = match?.[1] ?? '';
  if (!GITHUB_USERNAME.test(username)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }

  const asked = req.query['theme'];
  const theme: CardTheme | undefined =
    asked === 'light' || asked === 'dark' ? asked : undefined;

  res.type('image/svg+xml');

  try {
    const profile = await profiles.get(username);

    if (profile?.status !== 'ok') {
      // Kept briefly: the snapshot could be built a moment from now.
      res
        .set('Cache-Control', 'public, max-age=300, s-maxage=300')
        .send(renderMissingCard(username, theme));
      return;
    }

    if (shouldRenew(profile)) {
      // The card doesn't wait on this, or fail with it.
      profiles
        .renew(username)
        .catch((err) => logger.error('[card] renew', serializeError(err)));
    }

    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600').send(
      renderCard({
        username: profile.username,
        counts: positiveCounts(profile),
        theme,
      }),
    );
  } catch (err) {
    logger.error('[card]', serializeError(err));
    res.status(500).type('text/plain').send('Internal server error');
  }
};
