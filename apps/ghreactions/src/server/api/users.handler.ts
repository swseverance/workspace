import { UsersPage } from '@org/ghreactions-github';
import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { profiles } from './profile.handler';

export const USERS_PAGE_SIZE = 100;

/** GET /api/users?page=N: users ranked by total reactions, 1-based pages. */
export const usersHandler: RequestHandler = async (req, res) => {
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
