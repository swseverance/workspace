import { RequestHandler } from 'express';
import { EXERCISES_BY_ID } from '../../exercises';

export const exerciseExistsMiddleware: RequestHandler<{ id: string }> = (
  req,
  res,
  next,
) => {
  const exercise = EXERCISES_BY_ID[req.params.id];

  if (!exercise) {
    res.status(404).json({ message: 'Exercise not found' });
    return;
  }

  req.exercise = exercise;
  next();
};
