import type { Request, Response } from 'express';
import {
  createSessionHandler,
  deleteSessionHandler,
  getSessionHandler,
  requireUserMiddleware,
  SESSION_COOKIE_NAME,
  verifySessionCookieMiddleware,
} from './session';

const auth = vi.hoisted(() => ({
  verifySessionCookie: vi.fn(),
  verifyIdToken: vi.fn(),
  createSessionCookie: vi.fn(),
  revokeRefreshTokens: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({ getAuth: () => auth }));
vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

function createRequest(overrides: Partial<Request> = {}): Request {
  return { cookies: {}, body: {}, secure: true, ...overrides } as Request;
}

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as typeof res & Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('verifySessionCookieMiddleware', () => {
  it('sets req.user from a valid cookie', async () => {
    auth.verifySessionCookie.mockResolvedValue({ uid: 'u1' });
    const req = createRequest({ cookies: { [SESSION_COOKIE_NAME]: 'c' } });
    const next = vi.fn();

    await verifySessionCookieMiddleware(req, createResponse(), next);

    expect(auth.verifySessionCookie).toHaveBeenCalledWith('c', true);
    expect(req.user).toEqual({ uid: 'u1' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('carries on signed out when the cookie is invalid', async () => {
    auth.verifySessionCookie.mockRejectedValue(new Error('revoked'));
    const req = createRequest({ cookies: { [SESSION_COOKIE_NAME]: 'c' } });
    const next = vi.fn();

    await verifySessionCookieMiddleware(req, createResponse(), next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it('skips verification when there is no cookie', async () => {
    const next = vi.fn();

    await verifySessionCookieMiddleware(
      createRequest(),
      createResponse(),
      next,
    );

    expect(auth.verifySessionCookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('requireUserMiddleware', () => {
  it('401s without a user', () => {
    const res = createResponse();
    const next = vi.fn();

    requireUserMiddleware(createRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() with a user', () => {
    const next = vi.fn();

    requireUserMiddleware(
      createRequest({ user: { uid: 'u1' } }),
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledOnce();
  });
});

describe('getSessionHandler', () => {
  it('returns the user, or null when signed out', () => {
    const signedIn = createResponse();
    const signedOut = createResponse();

    getSessionHandler(
      createRequest({ user: { uid: 'u1' } }),
      signedIn,
      vi.fn(),
    );
    getSessionHandler(createRequest(), signedOut, vi.fn());

    expect(signedIn.json).toHaveBeenCalledWith({ user: { uid: 'u1' } });
    expect(signedOut.json).toHaveBeenCalledWith({ user: null });
  });
});

describe('createSessionHandler', () => {
  it('reports "valid" without re-minting when the cookie is for the same user', async () => {
    auth.verifyIdToken.mockResolvedValue({ uid: 'u1' });
    const res = createResponse();

    await createSessionHandler(
      createRequest({ user: { uid: 'u1' }, body: { idToken: 'id-token' } }),
      res,
      vi.fn(),
    );

    expect(auth.verifyIdToken).toHaveBeenCalledWith('id-token');
    expect(auth.createSessionCookie).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ status: 'valid' });
  });

  it('replaces a valid cookie that belongs to another user', async () => {
    auth.verifyIdToken.mockResolvedValue({ uid: 'u2' });
    auth.createSessionCookie.mockResolvedValue('session-cookie');
    const res = createResponse();

    await createSessionHandler(
      createRequest({ user: { uid: 'u1' }, body: { idToken: 'id-token' } }),
      res,
      vi.fn(),
    );

    expect(res.cookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'session-cookie',
      expect.any(Object),
    );
    expect(res.json).toHaveBeenCalledWith({ status: 'created' });
  });

  it('401s when the ID token fails verification despite a valid cookie', async () => {
    auth.verifyIdToken.mockRejectedValue(new Error('bad token'));
    const res = createResponse();

    await createSessionHandler(
      createRequest({ user: { uid: 'u1' }, body: { idToken: 'bad' } }),
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('mints an httpOnly cookie from the ID token', async () => {
    auth.createSessionCookie.mockResolvedValue('session-cookie');
    const res = createResponse();

    await createSessionHandler(
      createRequest({ body: { idToken: 'id-token' } }),
      res,
      vi.fn(),
    );

    expect(auth.createSessionCookie).toHaveBeenCalledWith('id-token', {
      expiresIn: expect.any(Number),
    });
    expect(res.cookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'session-cookie',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      }),
    );
    expect(res.json).toHaveBeenCalledWith({ status: 'created' });
  });

  it('400s without an ID token', async () => {
    const res = createResponse();

    await createSessionHandler(createRequest({ body: {} }), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('401s when Firebase rejects the ID token', async () => {
    auth.createSessionCookie.mockRejectedValue(new Error('bad token'));
    const res = createResponse();

    await createSessionHandler(
      createRequest({ body: { idToken: 'bad' } }),
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

describe('deleteSessionHandler', () => {
  it('revokes the user and clears the cookie', async () => {
    auth.revokeRefreshTokens.mockResolvedValue(undefined);
    const res = createResponse();

    await deleteSessionHandler(
      createRequest({ user: { uid: 'u1' } }),
      res,
      vi.fn(),
    );

    expect(auth.revokeRefreshTokens).toHaveBeenCalledWith('u1');
    expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('still clears the cookie when revoking fails or nobody is signed in', async () => {
    auth.revokeRefreshTokens.mockRejectedValue(new Error('gone'));
    const failed = createResponse();
    const anonymous = createResponse();

    await deleteSessionHandler(
      createRequest({ user: { uid: 'u1' } }),
      failed,
      vi.fn(),
    );
    await deleteSessionHandler(createRequest(), anonymous, vi.fn());

    expect(failed.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(anonymous.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(auth.revokeRefreshTokens).toHaveBeenCalledTimes(1);
  });
});
