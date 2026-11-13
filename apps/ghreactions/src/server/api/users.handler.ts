import { UsersPage } from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { profiles } from './profile.handler';

export const USERS_PAGE_SIZE = 100;

/** The start of a GitHub username (lowercase). */
const USERNAME_PREFIX = /^[a-z\d-]{1,39}$/;

/**
 * GET /api/users?page=N: users ranked by total reactions, 1-based pages.
 *
 * GET /api/users?q=PREFIX: the ranked users whose username starts with
 * PREFIX instead, as a single page (the top USERS_PAGE_SIZE of them).
 */
export const usersHandler: RequestHandler = async (req, res) => {
  const q = req.query['q'];
  if (q !== undefined && (typeof q !== 'string' || !q)) {
    res.status(400).json({ message: 'q must be a non-empty string' });
    return;
  }

  const page = Number(req.query['page'] ?? 1);
  if (!Number.isInteger(page) || page < 1) {
    res.status(400).json({ message: 'page must be a positive integer' });
    return;
  }

  try {
    const ranked = await profiles.ranked();

    if (q !== undefined) {
      const prefix = q.toLowerCase();
      const body: UsersPage = {
        // Nothing GitHub wouldn't allow in a username can match one.
        users: USERNAME_PREFIX.test(prefix)
          ? ranked
              .filter((user) => user.username.toLowerCase().startsWith(prefix))
              .slice(0, USERS_PAGE_SIZE)
          : [],
        page: 1,
        pageCount: 1,
      };
      res.json(body);
      return;
    }

    // Page 1 always exists, even with no users yet.
    const pageCount = Math.max(1, Math.ceil(ranked.length / USERS_PAGE_SIZE));
    if (page > pageCount) {
      res.status(404).json({ message: 'Page not found' });
      return;
    }

    const start = (page - 1) * USERS_PAGE_SIZE;
    const body: UsersPage = {
      users: ranked.slice(start, start + USERS_PAGE_SIZE),
      page,
      pageCount,
    };
    res.json(body);
  } catch (err) {
    logger.error('[users]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};
