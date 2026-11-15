import { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../exercises';
import {
  exercisesIndexRedirectHandler,
  MOVED_EXERCISES,
  movedExerciseRedirectHandler,
  SITEMAP_PATHS,
} from './seo';

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

describe('MOVED_EXERCISES', () => {
  const ids = EXERCISES.map((e) => e.id);

  it('maps ids that no longer exist to ids that do', () => {
    for (const [from, to] of Object.entries(MOVED_EXERCISES)) {
      expect(ids).not.toContain(from);
      expect(ids).toContain(to);
    }
  });
});

describe('movedExerciseRedirectHandler', () => {
  const handle = (id: string) => {
    const res = { redirect: vi.fn() } as unknown as Response;
    const next = vi.fn();

    movedExerciseRedirectHandler(
      { params: { id } } as unknown as Request,
      res,
      next,
    );

    return { res, next };
  };

  it('permanently redirects a moved exercise', () => {
    const [from, to] = Object.entries(MOVED_EXERCISES)[0];
    const { res, next } = handle(from);

    expect(res.redirect).toHaveBeenCalledWith(301, `/exercises/${to}`);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes every other id on', () => {
    for (const id of [EXERCISES[0].id, 'no-such-exercise', 'constructor']) {
      const { res, next } = handle(id);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    }
  });
});
