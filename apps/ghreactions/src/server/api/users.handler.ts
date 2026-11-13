import { UsersPage } from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler, Response } from 'express';
import * as logger from 'firebase-functions/logger';
import { profiles } from './profile.handler';

export const USERS_PAGE_SIZE = 100;

/** What GitHub allows in a username (any case). */
const USERNAME_CHARACTERS = /^[a-z0-9-]{1,39}$/;

/**
 * GET /api/users?page=N: users ranked by total reactions, 1-based pages.
 *
 * GET /api/users?q=PREFIX: the ranked users whose username starts with
 * PREFIX instead, as a single page (the top USERS_PAGE_SIZE of them).
 */
export const usersHandler: RequestHandler = async (req, res) => {
  const q = req.query['q'];
  if (q !== undefined) {
    await filteredUsers(q, res);
    return;
  }

  const page = Number(req.query['page'] ?? 1);
  if (!Number.isInteger(page) || page < 1) {
    res.status(400).json({ message: 'page must be a positive integer' });
    return;
  }

  try {
    const total = await profiles.rankedCount();
    // Page 1 always exists, even with no users yet.
    const pageCount = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
    if (page > pageCount) {
      res.status(404).json({ message: 'Page not found' });
      return;
    }

    const body: UsersPage = {
      users: await profiles.ranked(
        (page - 1) * USERS_PAGE_SIZE,
        USERS_PAGE_SIZE,
      ),
      page,
      pageCount,
    };
    res.json(body);
  } catch (err) {
    logger.error('[users]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function filteredUsers(q: unknown, res: Response): Promise<void> {
  if (typeof q !== 'string' || !q) {
    res.status(400).json({ message: 'q must be a non-empty string' });
    return;
  }

  const prefix = q.toLowerCase();

  try {
    const body: UsersPage = {
      // Nothing GitHub wouldn't allow in a username can match one.
      users: USERNAME_CHARACTERS.test(prefix)
        ? await profiles.startingWith(prefix, USERS_PAGE_SIZE)
        : [],
      page: 1,
      pageCount: 1,
    };
    res.json(body);
  } catch (err) {
    logger.error('[users]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
}
