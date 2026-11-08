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
    }
  }
}

// The one cookie name Firebase Hosting forwards to backends, so the same
// handlers work behind it too.
export const SESSION_COOKIE_NAME = '__session';

// 14 days; the max Firebase allows.
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

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
    const { uid } = await getAuth().verifySessionCookie(cookie, true);
    req.user = { uid };
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
  // The client POSTs here on every page load (it's Firebase's
  // onAuthStateChanged reporting the restored user, not necessarily a fresh
  // sign-in), but it can't tell whether the existing cookie is still good:
  // __session is httpOnly, invisible to client JS. The server already knows,
  // having just verified it for this same request, so skip re-minting
  // entirely when it's already valid.
  if (req.user) {
    res.status(200).json({ status: 'valid' });
    return;
  }

  const idToken = req.body?.idToken;

  if (typeof idToken !== 'string' || !idToken) {
    res.status(400).json({ message: 'Missing idToken' });
    return;
  }

  try {
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

/** Clears the session cookie and revokes the user's refresh tokens. */
export const deleteSessionHandler: RequestHandler = async (req, res) => {
  if (req.user) {
    try {
      // Revoke so a copy of this cookie (e.g. leaked via XSS or a stolen
      // device) can't go on being replayed after the user signs out here.
      await getAuth().revokeRefreshTokens(req.user.uid);
    } catch {
      // Already invalid or expired; nothing to revoke.
    }
  }

  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).end();
};
