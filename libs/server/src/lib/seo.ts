import { RequestHandler } from 'express';

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

/**
 * Serves /sitemap.xml listing `paths()` (each starting with "/") on
 * SITE_URL. `paths` runs per request, so it can read live data.
 */
export function sitemapHandler(
  paths: () => readonly string[] | Promise<readonly string[]>,
): RequestHandler {
  return async (_req, res, next) => {
    try {
      const origin = siteUrl();
      const locs = (await paths()).map(
        (path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`,
      );

      res
        .type('application/xml')
        .set('Cache-Control', 'public, max-age=3600')
        .send(
          [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...locs,
            '</urlset>',
            '',
          ].join('\n'),
        );
    } catch (err) {
      next(err);
    }
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
