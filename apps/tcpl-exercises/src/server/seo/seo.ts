import { RequestHandler } from 'express';
import { EXERCISES } from '../exercises';

/** Origin for canonical links and the sitemap, from the apphosting yaml. */
export function siteUrl(): string {
  return process.env['SITE_URL']!;
}

/**
 * Keeps every environment but prod out of search results. A header rather
 * than a robots.txt Disallow, which would stop crawlers from seeing it.
 */
export const noindexOutsideProdMiddleware: RequestHandler = (
  _req,
  res,
  next,
) => {
  if (process.env['ENVIRONMENT_NAME'] !== 'prod') {
    res.setHeader('X-Robots-Tag', 'noindex');
  }

  next();
};

export const robotsHandler: RequestHandler = (_req, res) => {
  res
    .type('text/plain')
    .set('Cache-Control', 'public, max-age=3600')
    .send(
      [
        'User-agent: *',
        'Disallow: /api/',
        '',
        `Sitemap: ${siteUrl()}/sitemap.xml`,
        '',
      ].join('\n'),
    );
};

const SITEMAP_PATHS = [
  '/',
  ...EXERCISES.map((exercise) => `/exercises/${exercise.id}`),
];

export const sitemapHandler: RequestHandler = (_req, res) => {
  const origin = siteUrl();

  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=3600')
    .send(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...SITEMAP_PATHS.map(
          (path) => `  <url><loc>${origin}${path}</loc></url>`,
        ),
        '</urlset>',
        '',
      ].join('\n'),
    );
};

/**
 * /exercises has no page of its own. Angular redirects to the first exercise
 * too, but with a 302; a 301 tells crawlers the move is permanent.
 */
export const exercisesIndexRedirectHandler: RequestHandler = (_req, res) => {
  res.redirect(301, `/exercises/${EXERCISES[0].id}`);
};
