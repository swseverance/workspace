import { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../exercises';
import {
  exercisesIndexRedirectHandler,
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
    redirect: vi.fn(),
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
  it('lists the home page and every exercise', () => {
    const res = createResponse();

    sitemapHandler(req, res, vi.fn());

    expect(res.type).toHaveBeenCalledWith('application/xml');
    const body = res.send.mock.calls[0][0] as string;
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      `${SITE_URL}/`,
      ...EXERCISES.map((e) => `${SITE_URL}/exercises/${e.id}`),
    ]);
  });
});

describe('exercisesIndexRedirectHandler', () => {
  it('permanently redirects to the first exercise', () => {
    const res = createResponse();

    exercisesIndexRedirectHandler(req, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      301,
      `/exercises/${EXERCISES[0].id}`,
    );
  });
});
