import { RequestHandler } from 'express';
import { EXERCISES } from '../exercises';

// robots.txt, the sitemap handler and noindex outside prod live in @org/server.

export const SITEMAP_PATHS = [
  '/',
  ...EXERCISES.map((exercise) => `/exercises/${exercise.id}`),
];

/**
 * /exercises has no page of its own. Angular redirects to the first exercise
 * too, but with a 302; a 301 tells crawlers the move is permanent.
 */
export const exercisesIndexRedirectHandler: RequestHandler = (_req, res) => {
  res.redirect(301, `/exercises/${EXERCISES[0].id}`);
};

/**
 * Exercises that have moved, old id to new. Add a line whenever an exercise
 * is renumbered or split, so old links and search results keep working.
 */
export const MOVED_EXERCISES: Record<string, string> = {
  // Split into 1-13a (horizontal) and 1-13b (vertical).
  '1-13': '1-13a',
  // Split into 3-2a (escape) and 3-2b (unescape).
  '3-2': '3-2a',
};

/** Permanently redirects a moved exercise's old page to its new one. */
export const movedExerciseRedirectHandler: RequestHandler = (
  req,
  res,
  next,
) => {
  const id = String(req.params['id']);

  // Object.hasOwn: an id like "constructor" must not match.
  if (!Object.hasOwn(MOVED_EXERCISES, id)) {
    next();
    return;
  }

  res.redirect(301, `/exercises/${MOVED_EXERCISES[id]}`);
};
