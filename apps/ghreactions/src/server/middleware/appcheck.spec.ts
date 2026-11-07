import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appCheckMiddleware } from './appcheck';

vi.mock('firebase-admin/app-check', () => ({
  getAppCheck: vi.fn(),
}));

import { getAppCheck } from 'firebase-admin/app-check';

function makeReq(token?: string) {
  return { headers: { 'x-firebase-appcheck': token } } as any;
}

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('appCheckMiddleware', () => {
  it('calls next() when token is valid', async () => {
    vi.mocked(getAppCheck).mockReturnValue({
      verifyToken: vi.fn().mockResolvedValue({}),
    } as any);
    const next = vi.fn();

    await appCheckMiddleware(makeReq('valid-token'), makeRes(), next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    vi.mocked(getAppCheck).mockReturnValue({
      verifyToken: vi.fn().mockRejectedValue(new Error('invalid token')),
    } as any);
    const res = makeRes();

    await appCheckMiddleware(makeReq('bad-token'), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('returns 401 when token is missing', async () => {
    vi.mocked(getAppCheck).mockReturnValue({
      verifyToken: vi.fn().mockRejectedValue(new Error('missing token')),
    } as any);
    const res = makeRes();

    await appCheckMiddleware(makeReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('does not call next() when verification fails', async () => {
    vi.mocked(getAppCheck).mockReturnValue({
      verifyToken: vi.fn().mockRejectedValue(new Error()),
    } as any);
    const next = vi.fn();

    await appCheckMiddleware(makeReq('bad-token'), makeRes(), next);

    expect(next).not.toHaveBeenCalled();
  });
});
