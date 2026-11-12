import { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../exercises';
import { exercisesIndexRedirectHandler, SITEMAP_PATHS } from './seo';

describe('SITEMAP_PATHS', () => {
  it('lists the home page and every exercise', () => {
    expect(SITEMAP_PATHS).toEqual([
      '/',
      ...EXERCISES.map((e) => `/exercises/${e.id}`),
    ]);
  });
});

describe('exercisesIndexRedirectHandler', () => {
  it('permanently redirects to the first exercise', () => {
    const res = { redirect: vi.fn() } as unknown as Response;

    exercisesIndexRedirectHandler({} as Request, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      301,
      `/exercises/${EXERCISES[0].id}`,
    );
  });
});
