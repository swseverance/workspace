import { z } from 'zod';
import {
  PullRequestSearchResponse,
  RawPullRequest,
  ReactionsFilter,
} from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { pullRequestQuerySchema } from '../../../validators/validators';
import {
  formatState,
  githubClient,
  toReactions,
  totalReactions,
} from '../client/client';
import { fillPage } from '../client/fill-page';

const query = `
  query($queryString: String!, $limit: Int!, $cursor: String) {
    search(query: $queryString, type: ISSUE, first: $limit, after: $cursor) {
      nodes {
        ... on PullRequest {
          id
          url
          title
          state
          updatedAt
          reactionGroups { content reactors { totalCount } }
          repository { nameWithOwner }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const buildQueryString = ({
  username,
  state,
  reactions,
}: z.infer<typeof pullRequestQuerySchema>): string => {
  const parts = [`author:${username}`, 'is:pr', 'sort:updated-desc'];
  if (state?.length === 1) parts.push(`state:${state[0].toLowerCase()}`);
  if (reactions?.length === 1) {
    if (reactions[0] === ReactionsFilter.WithReactions)
      parts.push('reactions:>0');
    if (reactions[0] === ReactionsFilter.WithoutReactions)
      parts.push('reactions:0');
  }
  return parts.join(' ');
};

const fromNode = ({
  reactionGroups,
  title,
  state,
  repository,
  ...raw
}: RawPullRequest): GHReactionsRow => ({
  ...raw,
  type: 'Pull Request',
  content: title,
  state: formatState(state),
  repository: repository.nameWithOwner,
  reactions: toReactions(reactionGroups),
  total: totalReactions(reactionGroups),
});

export const fetchPullRequests = async (
  params: z.infer<typeof pullRequestQuerySchema>,
): Promise<TablePage> => {
  const queryString = buildQueryString(params);
  return fillPage(async (limit, cursor) => {
    const data = await githubClient.gql<PullRequestSearchResponse>(query, {
      queryString,
      limit,
      cursor,
    });
    const { nodes, pageInfo } = data.search;
    return {
      rows: nodes.map(fromNode),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }, params.cursor);
};

export const api = { fetchPullRequests };
