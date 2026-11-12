import { githubClient, PAGE_SIZE } from '../client/client';

/**
 * Users (not organizations) by follower count, most first. GitHub returns at
 * most 1,000 results for any search, which caps how many this can find.
 */
export const TOP_USERS_QUERY = 'type:user followers:>=1000 sort:followers-desc';

/** GitHub's cap on results for a single search. */
export const SEARCH_RESULT_LIMIT = 1000;

const query = `
  query TopUsers($q: String!, $limit: Int!, $cursor: String) {
    search(query: $q, type: USER, first: $limit, after: $cursor) {
      nodes {
        ... on User { login }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

type TopUsersResponse = {
  search: {
    // Anything that isn't a User comes back as {}.
    nodes: ({ login?: string } | null)[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

/** The logins of up to `limit` of the most-followed GitHub users. */
export async function fetchTopUsers(
  limit = SEARCH_RESULT_LIMIT,
): Promise<string[]> {
  // A Set, in case results shift between pages and a user shows up twice.
  const logins = new Set<string>();
  let cursor: string | null = null;

  // Pages run one at a time to stay clear of GitHub's secondary rate limits.
  while (logins.size < limit) {
    const data: TopUsersResponse = await githubClient.gql<TopUsersResponse>(
      query,
      { q: TOP_USERS_QUERY, limit: PAGE_SIZE, cursor },
    );
    const { nodes, pageInfo } = data.search;

    for (const node of nodes) {
      if (node?.login) logins.add(node.login);
    }

    if (!pageInfo.hasNextPage || !pageInfo.endCursor) break;
    cursor = pageInfo.endCursor;
  }

  return [...logins].slice(0, limit);
}

/** Object wrapper so consumers can monkey-patch it in tests. */
export const api = { fetchTopUsers };
