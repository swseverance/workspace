import { RateLimitError, UserNotFoundError } from '../../../models/errors';
import { rateLimit } from '../rate-limit/rate-limit';

export const PAGE_SIZE = 100;

export const truncate = (text: string, limit = 120): string =>
  text.length > limit ? text.slice(0, limit).trimEnd() + '…' : text;

export const toReactions = (
  groups: { content: string; reactors: { totalCount: number } }[],
) =>
  Object.fromEntries(
    groups
      .filter((g) => g.reactors.totalCount > 0)
      .map((g) => [g.content, g.reactors.totalCount]),
  );

export const totalReactions = (
  groups: { reactors: { totalCount: number } }[],
) => groups.reduce((sum, g) => sum + g.reactors.totalCount, 0);

const STATE_LABELS: Record<string, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  MERGED: 'Merged',
  APPROVED: 'Approved',
  CHANGES_REQUESTED: 'Changes Requested',
  COMMENTED: 'Commented',
  DISMISSED: 'Dismissed',
  PENDING: 'Pending',
};

export const formatState = (state: string) => STATE_LABELS[state] ?? state;

export async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env['GHREACTIONS_TOKEN']}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const remainingHeader = res.headers.get('x-ratelimit-remaining');
  const resetHeader = res.headers.get('x-ratelimit-reset');

  // Both headers are absent on, e.g., an auth failure response — that's not
  // the same as GitHub reporting an actual remaining count of zero, so don't
  // record it as if it were.
  if (remainingHeader !== null && resetHeader !== null) {
    rateLimit.updateRateLimit(Number(remainingHeader), Number(resetHeader));
  }

  if (
    rateLimit.isPrimaryLimitCloseToBeingBreached(res) ||
    rateLimit.isSecondaryLimitBreached(res)
  ) {
    throw new RateLimitError();
  }

  const json: {
    data?: T;
    errors?: { type: string; message?: string }[];
    message?: string;
  } = await res.json();

  if (json.errors?.some((e) => e.type === 'NOT_FOUND'))
    throw new UserNotFoundError();
  if (json.errors?.length)
    throw new Error(json.errors[0].message ?? 'GitHub API error');
  // A response with neither `data` nor `errors` isn't a GraphQL result at
  // all — e.g. a flat `{ "message": "Bad credentials" }` body on auth
  // failure. Surface that reason instead of crashing downstream on `.search`.
  if (json.data === undefined)
    throw new Error(json.message ?? `GitHub API error: ${res.status}`);

  return json.data;
}

/**
 * Object wrapper around `gql` so cross-module consumers can monkey-patch it
 * in tests (the Angular unit-test runner treats plain ESM named exports as
 * read-only bindings, so vi.mock/vi.spyOn can't intercept a relative import).
 */
export const githubClient = { gql };
