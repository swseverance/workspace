import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitError, UserNotFoundError } from '../../../models/errors';
import { rateLimit } from '../rate-limit/rate-limit';
import { formatState, gql, toReactions } from './client';

function makeResponse(options: {
  status?: number;
  headers?: Record<string, string>;
  body?: { data?: unknown; errors?: { type: string }[]; message?: string };
  nonJson?: boolean;
}): Response {
  const { status = 200, headers = {}, body = {}, nonJson = false } = options;
  const map = new Map(Object.entries(headers));
  return {
    status,
    headers: {
      get: (k: string) => map.get(k) ?? null,
      has: (k: string) => map.has(k),
    },
    json: () =>
      nonJson ? Promise.reject(new SyntaxError()) : Promise.resolve(body),
  } as unknown as Response;
}

const inHalfAnHour = String(Math.floor(Date.now() / 1000) + 1800);

const defaultHeaders = {
  'x-ratelimit-remaining': '4000',
  'x-ratelimit-reset': inHalfAnHour,
};

beforeEach(() => {
  rateLimit.blockUntil = vi.fn().mockResolvedValue(undefined);
});

describe('toReactions', () => {
  it('converts reaction groups to a record', () => {
    expect(
      toReactions([
        { content: 'THUMBS_UP', reactors: { totalCount: 3 } },
        { content: 'HEART', reactors: { totalCount: 1 } },
      ]),
    ).toEqual({ THUMBS_UP: 3, HEART: 1 });
  });

  it('returns empty object for empty input', () => {
    expect(toReactions([])).toEqual({});
  });
});

describe('formatState', () => {
  it.each([
    ['OPEN', 'Open'],
    ['CLOSED', 'Closed'],
    ['MERGED', 'Merged'],
  ])('%s → %s', (input, expected) => {
    expect(formatState(input)).toBe(expected);
  });

  it('returns unknown states as-is', () => {
    expect(formatState('DRAFT')).toBe('DRAFT');
  });
});

describe('gql', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls GitHub GraphQL endpoint with correct method and headers', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ headers: defaultHeaders, body: { data: {} } }),
    );

    await gql('query { viewer { login } }', { login: 'sam' });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('does not pause GitHub calls while plenty of the window remains', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ headers: defaultHeaders, body: { data: {} } }),
    );

    await gql('{ viewer { login } }', {});

    expect(rateLimit.blockUntil).not.toHaveBeenCalled();
  });

  it('pauses until the reset when the window is nearly spent, but still returns the data', async () => {
    const data = { viewer: { login: 'sam' } };
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({
        headers: {
          'x-ratelimit-remaining': '50',
          'x-ratelimit-reset': inHalfAnHour,
        },
        body: { data },
      }),
    );

    await expect(gql('{ viewer { login } }', {})).resolves.toEqual(data);
    expect(rateLimit.blockUntil).toHaveBeenCalledWith(Number(inHalfAnHour));
  });

  it('does not pause when rate-limit headers are absent (e.g. an auth failure)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ status: 401, body: { message: 'Bad credentials' } }),
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow();

    expect(rateLimit.blockUntil).not.toHaveBeenCalled();
  });

  it('throws with the response message when the body has neither data nor errors', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ status: 401, body: { message: 'Bad credentials' } }),
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow(
      'Bad credentials',
    );
  });

  it('falls back to the HTTP status when the body has no message either', async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ status: 502, body: {} }));

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow(
      'GitHub API error: 502',
    );
  });

  it('falls back to the HTTP status when the body is not JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ status: 502, nonJson: true }),
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow(
      'GitHub API error: 502',
    );
  });

  it('throws RateLimitError for a GraphQL primary-limit response (200 with remaining 0)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': inHalfAnHour,
        },
        body: { errors: [{ type: 'RATE_LIMITED' }] },
      }),
    );

    const error = await gql('{ viewer { login } }', {}).catch((e) => e);

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error).toMatchObject({ retryAt: Number(inHalfAnHour) });
    expect(rateLimit.blockUntil).toHaveBeenCalledWith(Number(inHalfAnHour));
  });

  it('throws RateLimitError for a secondary-limit response with retry-after', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({
        status: 403,
        headers: { 'retry-after': '60' },
        body: { message: 'You have exceeded a secondary rate limit.' },
      }),
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow(
      RateLimitError,
    );
    expect(rateLimit.blockUntil).toHaveBeenCalled();
  });

  it('throws RateLimitError for a secondary-limit message with no timing headers', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({
        body: { message: 'You have exceeded a secondary rate limit.' },
      }),
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow(
      RateLimitError,
    );
  });

  it('throws UserNotFoundError when response contains a NOT_FOUND error', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({
        headers: defaultHeaders,
        body: { data: { user: null }, errors: [{ type: 'NOT_FOUND' }] },
      }),
    );

    await expect(gql('{ user { login } }', {})).rejects.toThrow(
      UserNotFoundError,
    );
  });

  it('returns data on success', async () => {
    const data = { viewer: { login: 'sam' } };
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ headers: defaultHeaders, body: { data } }),
    );

    await expect(gql('{ viewer { login } }', {})).resolves.toEqual(data);
  });
});
