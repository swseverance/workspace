import type { RequestHandler } from 'express';
import { getAuth } from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';
import type {
  CreateSessionRequestBody,
  CreateSessionResponseBody,
  ErrorResponseBody,
  SessionResponseBody,
  SessionUser,
} from './models';

declare global {
  namespace Express {
    interface Request {
      /** Set by verifySessionCookieMiddleware when the cookie is valid. */
      user?: SessionUser;
      /** When that cookie expires, in ms since the epoch. Set with `user`. */
      sessionExpiresAt?: number;
    }
  }
}

// The one cookie name Firebase Hosting forwards to backends, so the same
// handlers work behind it too.
export const SESSION_COOKIE_NAME = '__session';

// 14 days; the max Firebase allows.
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

// A cookie older than this is replaced the next time the client checks in
// (every page load), so the 14 days count from the last visit rather than
// from the sign-in. Not on every check-in: minting is a call to Google.
const SESSION_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Sets `req.user` when the request carries a valid session cookie. Needs
 * cookie-parser in front of it, and firebase-admin's initializeApp() called
 * at startup.
 */
export const verifySessionCookieMiddleware: RequestHandler = async (
  req,
  _res,
  next,
) => {
  const cookie: unknown = req.cookies?.[SESSION_COOKIE_NAME];

  if (typeof cookie !== 'string' || !cookie) {
    next();
    return;
  }

  try {
    const { uid, exp } = await getAuth().verifySessionCookie(cookie, true);
    req.user = { uid };
    req.sessionExpiresAt = exp * 1000;
  } catch {
    // Expired, revoked or forged: carry on signed out.
  }

  next();
};

/** 401s unless verifySessionCookieMiddleware found a signed-in user. */
export const requireUserMiddleware: RequestHandler<
  unknown,
  ErrorResponseBody
> = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
};

/**
 * Lets the app learn who the session cookie belongs to with a plain HTTP
 * call, both during SSR (cookie forwarded by forwardCookieInterceptor) and
 * in the browser (served from the transfer cache during hydration).
 */
export const getSessionHandler: RequestHandler<unknown, SessionResponseBody> = (
  req,
  res,
) => {
  res.json({ user: req.user ?? null });
};

/** Exchanges a Firebase ID token for an httpOnly session cookie. */
export const createSessionHandler: RequestHandler<
  unknown,
  CreateSessionResponseBody | ErrorResponseBody,
  Partial<CreateSessionRequestBody> | undefined
> = async (req, res) => {
  const idToken = req.body?.idToken;

  if (typeof idToken !== 'string' || !idToken) {
    res.status(400).json({ message: 'Missing idToken' });
    return;
  }

  try {
    // The client POSTs here on every page load (it's Firebase's
    // onAuthStateChanged reporting the restored user, not necessarily a
    // fresh sign-in), but it can't tell whether the existing cookie is still
    // good: __session is httpOnly, invisible to client JS. The server
    // already verified it for this same request, so skip re-minting when
    // it's valid, recent and belongs to the token's user. A cookie for
    // another account (one whose clear failed before a different sign-in)
    // is replaced, or the API would act as the old user. One that's no
    // longer recent is replaced too, which is what keeps a regular visitor
    // from ever reaching its expiry.
    if (req.user && isRecent(req.sessionExpiresAt)) {
      const { uid } = await getAuth().verifyIdToken(idToken);

      if (uid === req.user.uid) {
        res.status(200).json({ status: 'valid' });
        return;
      }
    }

    const sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    res.cookie(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_MAX_AGE_MS,
      httpOnly: true,
      secure: req.secure,
      sameSite: 'lax',
    });
    res.status(200).json({ status: 'created' });
  } catch (error) {
    logger.error('[session] failed to create session cookie', error);
    res.status(401).json({ message: 'Failed to create session' });
  }
};

/** Whether a cookie expiring then was minted under SESSION_RENEW_AFTER_MS ago. */
function isRecent(expiresAt: number | undefined): boolean {
  if (expiresAt === undefined) {
    return false;
  }

  const age = SESSION_MAX_AGE_MS - (expiresAt - Date.now());
  return age < SESSION_RENEW_AFTER_MS;
}

/**
 * Clears this browser's session cookie, and nothing more. Deliberately not
 * revokeRefreshTokens(): that ends the user's sessions on every device, and
 * the client also calls this whenever Firebase has no user on page load
 * (e.g. the browser dropped its local data), not only on a sign-out. The
 * cost is that a copy of the cookie taken beforehand stays usable until it
 * expires.
 */
export const deleteSessionHandler: RequestHandler = (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).end();
};
