import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES_BY_ID } from '../../exercises';
import { exerciseExistsMiddleware } from './exercise-exists';

function createRequest(id: string): Request<{ id: string }> {
  return { params: { id } } as unknown as Request<{ id: string }>;
}

function createResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('exerciseExistsMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets req.exercise and calls next() when the exercise exists', () => {
    const exercise = EXERCISES_BY_ID['1-1'];
    const req = createRequest('1-1');
    const res = createResponse();
    const next = vi.fn();

    exerciseExistsMiddleware(req, res, next);

    expect(req.exercise).toBe(exercise);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds 404 and does not call next() when the exercise does not exist', () => {
    const req = createRequest('does-not-exist');
    const res = createResponse();
    const next = vi.fn();

    exerciseExistsMiddleware(req, res, next);

    expect(req.exercise).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Exercise not found' });
  });
});
