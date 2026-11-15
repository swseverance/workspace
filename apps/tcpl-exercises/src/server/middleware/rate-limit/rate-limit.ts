import { redisProvider } from '@org/redis';
import { createProvider } from '@org/server';
import { Ratelimit } from '@upstash/ratelimit';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';

type RateLimitOptions = {
  /** Names the limiters' keys in Redis. */
  name: string;
  /** One signed-in user. */
  user: Limit;
  /** All signed-in users together. */
  global: Limit;
  /** All signed-out visitors together. */
  signedOut: Limit;
};

type Limit = {
  /** Requests allowed per minute. */
  requests: number;
  /** What a request over the limit is told. */
  message: string;
};

const GLOBAL_KEY = 'global';
const SIGNED_OUT_KEY = 'signed-out';

/**
 * Three limits on one route:
 * - per user, so one person can't hammer it;
 * - across all users, because the per-user limit doesn't stop someone with
 *   many accounts;
 * - one shared allowance for signed-out requests, which can't be told apart
 *   (per-IP limits would lump a whole classroom together). A flood of them
 *   can't use up signed-in users' global limit, and signing in gets around
 *   it.
 */
function rateLimitMiddleware({
  name,
  user,
  global,
  signedOut,
}: RateLimitOptions): RequestHandler {
  const limiter = (perMinute: number, suffix: string) =>
    createProvider(
      () =>
        new Ratelimit({
          redis: redisProvider.get(),
          limiter: Ratelimit.slidingWindow(perMinute, '60 s'),
          prefix: `ratelimit:${name}${suffix}`,
        }),
    );

  const userRatelimit = limiter(user.requests, '');
  const globalRatelimit = limiter(global.requests, '-global');
  const signedOutRatelimit = limiter(signedOut.requests, '-signed-out');

  return async (req, res, next) => {
    const uid = req.user?.uid;

    // Express 4 doesn't catch rejected promises from async middleware.
    try {
      if (!uid) {
        const result = await signedOutRatelimit.get().limit(SIGNED_OUT_KEY);

        if (!result.success) {
          logger.warn('[rate-limit] request rejected by signed-out limit');
          res.status(429).json({ message: signedOut.message });
          return;
        }

        next();
        return;
      }

      // Checked first, so one user hammering the API is stopped by their own
      // limit without using up everyone else's shared allowance.
      const own = await userRatelimit.get().limit(uid);

      if (!own.success) {
        logger.warn('[rate-limit] request rejected', { uid });
        res.status(429).json({ message: user.message });
        return;
      }

      const all = await globalRatelimit.get().limit(GLOBAL_KEY);

      if (!all.success) {
        logger.warn('[rate-limit] request rejected by global limit', { uid });
        res.status(429).json({ message: global.message });
        return;
      }
    } catch (err) {
      next(err);
      return;
    }

    next();
  };
}

// Submitting runs the code in a real Vercel Sandbox, which costs money, so
// it's limited tightly. The global limit is high enough for a busy
// classroom, and low enough that a sustained flood costs a bounded amount
// per month.
export const SUBMIT_EXERCISE_LIMITS: RateLimitOptions = {
  name: 'submit-exercise',
  user: {
    requests: 5,
    message: 'Too many submissions. Please wait a moment and try again.',
  },
  global: {
    requests: 30,
    message:
      'The site is receiving a lot of submissions right now. Please try again in a minute.',
  },
  signedOut: {
    requests: 10,
    message:
      'Too many people are submitting without signing in right now. Sign in to keep submitting, or try again in a minute.',
  },
};

export const submitExerciseRateLimitMiddleware = rateLimitMiddleware(
  SUBMIT_EXERCISE_LIMITS,
);

const FORMAT_MESSAGE =
  'Too many format requests. Please wait a moment and try again.';

// Formatting runs on this server and costs only a little CPU, so its limits
// are looser than submitting's; they are there to stop a script, not a
// person.
export const FORMAT_CODE_LIMITS: RateLimitOptions = {
  name: 'format-code',
  user: { requests: 20, message: FORMAT_MESSAGE },
  global: { requests: 120, message: FORMAT_MESSAGE },
  signedOut: { requests: 40, message: FORMAT_MESSAGE },
};

export const formatCodeRateLimitMiddleware =
  rateLimitMiddleware(FORMAT_CODE_LIMITS);
