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
