import { Ratelimit } from '@upstash/ratelimit';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { redis } from '../../redis';

// Submitting runs the code in a real Vercel Sandbox, which costs money, so
// it's limited more tightly than the other authenticated exercise routes.
const submitExerciseRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'ratelimit:submit-exercise',
});

export const submitExerciseRateLimitMiddleware: RequestHandler = async (
  req,
  res,
  next,
) => {
  let success: boolean;

  // Express 4 doesn't catch rejected promises from async middleware.
  try {
    ({ success } = await submitExerciseRatelimit.limit(req.user!.uid));
  } catch (err) {
    next(err);
    return;
  }

  if (!success) {
    logger.warn('[rate-limit] request rejected', { uid: req.user!.uid });
    res.status(429).json({ message: 'Too Many Requests' });
    return;
  }

  next();
};
