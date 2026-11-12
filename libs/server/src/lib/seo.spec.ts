import { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  noindexOutsideProdMiddleware,
  robotsHandler,
  sitemapHandler,
} from './seo';

const SITE_URL = 'https://example.test';

beforeEach(() => vi.stubEnv('SITE_URL', SITE_URL));
afterEach(() => vi.unstubAllEnvs());

function createResponse() {
  const res = {
    type: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  return res as typeof res & Response;
}

const req = {} as Request;

describe('noindexOutsideProdMiddleware', () => {
  it('sets X-Robots-Tag: noindex outside prod', () => {
    vi.stubEnv('ENVIRONMENT_NAME', 'dev');
    const res = createResponse();
    const next = vi.fn();

    noindexOutsideProdMiddleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Robots-Tag', 'noindex');
    expect(next).toHaveBeenCalledOnce();
  });

  it('leaves prod indexable', () => {
    vi.stubEnv('ENVIRONMENT_NAME', 'prod');
    const res = createResponse();
    const next = vi.fn();

    noindexOutsideProdMiddleware(req, res, next);

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('robotsHandler', () => {
  it('points crawlers at the sitemap and away from the API', () => {
    const res = createResponse();

    robotsHandler(req, res, vi.fn());

    expect(res.type).toHaveBeenCalledWith('text/plain');
    const body = res.send.mock.calls[0][0] as string;
    expect(body).toContain('Disallow: /api/');
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});

describe('sitemapHandler', () => {
  const locs = (res: ReturnType<typeof createResponse>) =>
    [
      ...(res.send.mock.calls[0][0] as string).matchAll(/<loc>([^<]+)<\/loc>/g),
    ].map((m) => m[1]);

  it('lists each path on the site URL', async () => {
    const res = createResponse();

    await sitemapHandler(() => ['/', '/a'])(req, res, vi.fn());

    expect(res.type).toHaveBeenCalledWith('application/xml');
    expect(locs(res)).toEqual([`${SITE_URL}/`, `${SITE_URL}/a`]);
  });

  it('awaits async paths and escapes them', async () => {
    const res = createResponse();

    await sitemapHandler(async () => ['/a?b=1&c=2'])(req, res, vi.fn());

    expect(locs(res)).toEqual([`${SITE_URL}/a?b=1&amp;c=2`]);
  });

  it('passes errors on', async () => {
    const res = createResponse();
    const next = vi.fn();
    const error = new Error('unavailable');

    await sitemapHandler(() => Promise.reject(error))(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.send).not.toHaveBeenCalled();
  });
});
