import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitError, UserNotFoundError } from '../../../models/errors';
import { rateLimit } from '../rate-limit/rate-limit';
import { formatState, gql, toReactions } from './client';

function makeResponse(options: {
  status?: number;
  headers?: Record<string, string>;
  body?: { data?: unknown; errors?: { type: string }[]; message?: string };
}): Response {
  const { status = 200, headers = {}, body = {} } = options;
  const map = new Map(Object.entries(headers));
  return {
    status,
    headers: {
      get: (k: string) => map.get(k) ?? null,
      has: (k: string) => map.has(k),
    },
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const defaultHeaders = {
  'x-ratelimit-remaining': '4000',
  'x-ratelimit-reset': '1700000000',
};

beforeEach(() => {
  rateLimit.updateRateLimit = vi.fn();
  rateLimit.isPrimaryLimitCloseToBeingBreached = vi.fn().mockReturnValue(false);
  rateLimit.isSecondaryLimitBreached = vi.fn().mockReturnValue(false);
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

  it('calls updateRateLimit with parsed header values', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ headers: defaultHeaders, body: { data: {} } }),
    );

    await gql('{ viewer { login } }', {});

    expect(rateLimit.updateRateLimit).toHaveBeenCalledWith(4000, 1700000000);
  });

  it('does not call updateRateLimit when rate-limit headers are absent (e.g. an auth failure)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ status: 401, body: { message: 'Bad credentials' } }),
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow();

    expect(rateLimit.updateRateLimit).not.toHaveBeenCalled();
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

  it('throws RateLimitError when primary limit is close to breached', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ headers: defaultHeaders }),
    );
    vi.mocked(rateLimit.isPrimaryLimitCloseToBeingBreached).mockReturnValue(
      true,
    );

    await expect(gql('{ viewer { login } }', {})).rejects.toThrow(
      RateLimitError,
    );
  });

  it('throws RateLimitError when secondary limit is breached', async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeResponse({ headers: defaultHeaders }),
    );
    vi.mocked(rateLimit.isSecondaryLimitBreached).mockReturnValue(true);

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
