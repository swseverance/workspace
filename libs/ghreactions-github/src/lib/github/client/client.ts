import { RateLimitError, UserNotFoundError } from '../../../models/errors';
import { GitHubErrorBody, rateLimit } from '../rate-limit/rate-limit';

export const PAGE_SIZE = 100;

type GraphQLResponse<T> = GitHubErrorBody & { data?: T };

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

  // Not every response is JSON (e.g. an HTML 502 from a proxy).
  const body: GraphQLResponse<T> | null = await res.json().catch(() => null);

  // Awaited rather than fire-and-forget: Cloud Run may throttle CPU once the
  // response is sent, so a background write could silently never land.
  const retryAt = rateLimit.retryAt(res, body);
  if (retryAt !== null) {
    await rateLimit.blockUntil(retryAt);
    if (rateLimit.isRateLimited(res, body)) throw new RateLimitError(retryAt);
  }

  if (body === null) throw new Error(`GitHub API error: ${res.status}`);
  if (body.errors?.some((e) => e.type === 'NOT_FOUND'))
    throw new UserNotFoundError();
  if (body.errors?.length)
    throw new Error(body.errors[0].message ?? 'GitHub API error');
  // A response with neither `data` nor `errors` isn't a GraphQL result at
  // all — e.g. a flat `{ "message": "Bad credentials" }` body on auth
  // failure. Surface that reason instead of crashing downstream on `.search`.
  if (body.data === undefined)
    throw new Error(body.message ?? `GitHub API error: ${res.status}`);

  return body.data;
}

/**
 * Object wrapper around `gql` so cross-module consumers can monkey-patch it
 * in tests (the Angular unit-test runner treats plain ESM named exports as
 * read-only bindings, so vi.mock/vi.spyOn can't intercept a relative import).
 */
export const githubClient = { gql };
