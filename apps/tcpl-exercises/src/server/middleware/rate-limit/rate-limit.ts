import { redisProvider } from '@org/redis';
import { createProvider } from '@org/server';
import { Ratelimit } from '@upstash/ratelimit';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';

// Submitting runs the code in a real Vercel Sandbox, which costs money, so
// it's limited more tightly than the other authenticated exercise routes.
const submitExerciseRatelimit = createProvider(
  () =>
    new Ratelimit({
      redis: redisProvider.get(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'ratelimit:submit-exercise',
    }),
);

// The per-user limit doesn't stop someone with many accounts, so this caps
// submissions across all users. Kept high enough for a busy classroom, and
// low enough that a sustained flood costs a bounded amount per month.
const globalSubmitExerciseRatelimit = createProvider(
  () =>
    new Ratelimit({
      redis: redisProvider.get(),
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      prefix: 'ratelimit:submit-exercise-global',
    }),
);

const GLOBAL_KEY = 'global';

export const USER_LIMIT_MESSAGE =
  'Too many submissions. Please wait a moment and try again.';

export const GLOBAL_LIMIT_MESSAGE =
  'The site is receiving a lot of submissions right now. Please try again in a minute.';

export const submitExerciseRateLimitMiddleware: RequestHandler = async (
  req,
  res,
  next,
) => {
  const uid = req.user!.uid;

  // Express 4 doesn't catch rejected promises from async middleware.
  try {
    // Checked first, so one user hammering the API is stopped by their own
    // limit without using up everyone else's shared allowance.
    const user = await submitExerciseRatelimit.get().limit(uid);

    if (!user.success) {
      logger.warn('[rate-limit] request rejected', { uid });
      res.status(429).json({ message: USER_LIMIT_MESSAGE });
      return;
    }

    const global = await globalSubmitExerciseRatelimit.get().limit(GLOBAL_KEY);

    if (!global.success) {
      logger.warn('[rate-limit] request rejected by global limit', { uid });
      res.status(429).json({ message: GLOBAL_LIMIT_MESSAGE });
      return;
    }
  } catch (err) {
    next(err);
    return;
  }

  next();
};
