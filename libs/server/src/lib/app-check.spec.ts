import type { Request, Response } from 'express';
import { appCheckMiddleware } from './app-check';
import { SSR_LOOPBACK_HEADER, SSR_LOOPBACK_TOKEN } from './ssr-loopback';

const { verifyToken } = vi.hoisted(() => ({ verifyToken: vi.fn() }));
const { loggerError } = vi.hoisted(() => ({ loggerError: vi.fn() }));

vi.mock('firebase-admin/app-check', () => ({
  getAppCheck: () => ({ verifyToken }),
}));

vi.mock('firebase-functions/logger', () => ({
  error: loggerError,
}));

function createRequest(
  token?: string,
  {
    remoteAddress = '203.0.113.7',
    loopbackToken,
  }: { remoteAddress?: string; loopbackToken?: string } = {},
): Request {
  const headers: Record<string, string> = {};

  if (token !== undefined) {
    headers['x-firebase-appcheck'] = token;
  }

  if (loopbackToken !== undefined) {
    headers[SSR_LOOPBACK_HEADER] = loopbackToken;
  }

  return { headers, socket: { remoteAddress } } as unknown as Request;
}

function createResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('appCheckMiddleware', () => {
  beforeEach(() => {
    verifyToken.mockReset();
    loggerError.mockReset();
  });

  it('calls next() when the App Check token is valid', async () => {
    verifyToken.mockResolvedValue({ appId: 'some-app-id' });
    const req = createRequest('valid-token');
    const res = createResponse();
    const next = vi.fn();

    await appCheckMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds 401 and does not call next() when the token is invalid', async () => {
    verifyToken.mockRejectedValue(new Error('invalid token'));
    const req = createRequest('bad-token');
    const res = createResponse();
    const next = vi.fn();

    await appCheckMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('responds 401 when no App Check token header is present', async () => {
    verifyToken.mockRejectedValue(new Error('no token present'));
    const req = createRequest(undefined);
    const res = createResponse();
    const next = vi.fn();

    await appCheckMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith(undefined);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('logs a serialized Error via the firebase logger', async () => {
    const thrown = new Error('invalid token');
    verifyToken.mockRejectedValue(thrown);
    const req = createRequest('bad-token');
    const res = createResponse();
    const next = vi.fn();

    await appCheckMiddleware(req, res, next);

    expect(loggerError).toHaveBeenCalledWith('[App Check] verifyToken failed', {
      error: {
        name: thrown.name,
        message: thrown.message,
        stack: thrown.stack,
      },
    });
  });

  it('logs a string fallback when a non-Error value is thrown', async () => {
    verifyToken.mockRejectedValue('some rejection reason');
    const req = createRequest('bad-token');
    const res = createResponse();
    const next = vi.fn();

    await appCheckMiddleware(req, res, next);

    expect(loggerError).toHaveBeenCalledWith('[App Check] verifyToken failed', {
      error: 'some rejection reason',
    });
  });

  describe('SSR loopback bypass', () => {
    it.each(['127.0.0.1', '::1', '::ffff:127.0.0.1'])(
      'skips App Check for a loopback request (%s) carrying the process token',
      async (remoteAddress) => {
        const req = createRequest(undefined, {
          remoteAddress,
          loopbackToken: SSR_LOOPBACK_TOKEN,
        });
        const res = createResponse();
        const next = vi.fn();

        await appCheckMiddleware(req, res, next);

        expect(verifyToken).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledOnce();
      },
    );

    it('requires App Check when the process token comes from a non-loopback address', async () => {
      verifyToken.mockRejectedValue(new Error('no token present'));
      const req = createRequest(undefined, {
        loopbackToken: SSR_LOOPBACK_TOKEN,
      });
      const res = createResponse();
      const next = vi.fn();

      await appCheckMiddleware(req, res, next);

      expect(verifyToken).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it.each([
      ['a wrong token', 'not-the-token'],
      ['a token of the same length', 'x'.repeat(SSR_LOOPBACK_TOKEN.length)],
      ['no token', undefined],
    ])(
      'requires App Check for a loopback request with %s',
      async (_label, loopbackToken) => {
        verifyToken.mockRejectedValue(new Error('no token present'));
        const req = createRequest(undefined, {
          remoteAddress: '127.0.0.1',
          loopbackToken,
        });
        const res = createResponse();
        const next = vi.fn();

        await appCheckMiddleware(req, res, next);

        expect(verifyToken).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
      },
    );
  });
});
