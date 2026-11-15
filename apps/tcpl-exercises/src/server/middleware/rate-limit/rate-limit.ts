import { redisProvider } from '@org/redis';
import { createProvider } from '@org/server';
import { Ratelimit } from '@upstash/ratelimit';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';

type RateLimitOptions = {
  /** Names the limiters' keys in Redis. */
  name: string;
  /** Requests per minute for one signed-in user. */
  perUser: number;
  /** Requests per minute for all signed-in users together. */
  global: number;
  /** Requests per minute for all signed-out visitors together. */
  signedOut: number;
  messages: { user: string; global: string; signedOut: string };
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
  perUser,
  global,
  signedOut,
  messages,
}: RateLimitOptions): RequestHandler {
  const limiter = (requests: number, suffix: string) =>
    createProvider(
      () =>
        new Ratelimit({
          redis: redisProvider.get(),
          limiter: Ratelimit.slidingWindow(requests, '60 s'),
          prefix: `ratelimit:${name}${suffix}`,
        }),
    );

  const userRatelimit = limiter(perUser, '');
  const globalRatelimit = limiter(global, '-global');
  const signedOutRatelimit = limiter(signedOut, '-signed-out');

  return async (req, res, next) => {
    const uid = req.user?.uid;

    // Express 4 doesn't catch rejected promises from async middleware.
    try {
      if (!uid) {
        const result = await signedOutRatelimit.get().limit(SIGNED_OUT_KEY);

        if (!result.success) {
          logger.warn('[rate-limit] request rejected by signed-out limit');
          res.status(429).json({ message: messages.signedOut });
          return;
        }

        next();
        return;
      }

      // Checked first, so one user hammering the API is stopped by their own
      // limit without using up everyone else's shared allowance.
      const user = await userRatelimit.get().limit(uid);

      if (!user.success) {
        logger.warn('[rate-limit] request rejected', { uid });
        res.status(429).json({ message: messages.user });
        return;
      }

      const all = await globalRatelimit.get().limit(GLOBAL_KEY);

      if (!all.success) {
        logger.warn('[rate-limit] request rejected by global limit', { uid });
        res.status(429).json({ message: messages.global });
        return;
      }
    } catch (err) {
      next(err);
      return;
    }

    next();
  };
}

export const USER_LIMIT_MESSAGE =
  'Too many submissions. Please wait a moment and try again.';

export const GLOBAL_LIMIT_MESSAGE =
  'The site is receiving a lot of submissions right now. Please try again in a minute.';

export const SIGNED_OUT_LIMIT_MESSAGE =
  'Too many people are submitting without signing in right now. Sign in to keep submitting, or try again in a minute.';

// Submitting runs the code in a real Vercel Sandbox, which costs money, so
// it's limited tightly. The global limit is high enough for a busy
// classroom, and low enough that a sustained flood costs a bounded amount
// per month.
export const submitExerciseRateLimitMiddleware = rateLimitMiddleware({
  name: 'submit-exercise',
  perUser: 5,
  global: 30,
  signedOut: 10,
  messages: {
    user: USER_LIMIT_MESSAGE,
    global: GLOBAL_LIMIT_MESSAGE,
    signedOut: SIGNED_OUT_LIMIT_MESSAGE,
  },
});

export const FORMAT_LIMIT_MESSAGE =
  'Too many format requests. Please wait a moment and try again.';

// Formatting runs on this server and costs only a little CPU, so its limits
// are looser than submitting's; they are there to stop a script, not a
// person.
export const formatCodeRateLimitMiddleware = rateLimitMiddleware({
  name: 'format-code',
  perUser: 20,
  global: 120,
  signedOut: 40,
  messages: {
    user: FORMAT_LIMIT_MESSAGE,
    global: FORMAT_LIMIT_MESSAGE,
    signedOut: FORMAT_LIMIT_MESSAGE,
  },
});
