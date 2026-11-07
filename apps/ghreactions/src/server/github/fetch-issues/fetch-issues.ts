import { z } from 'zod';
import {
  IssueSearchResponse,
  RawIssue,
  ReactionsFilter,
} from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { issueQuerySchema } from '../../../validators/validators';
import {
  formatState,
  githubClient,
  PAGE_SIZE,
  toReactions,
  totalReactions,
} from '../client/client';

const query = `
  query($queryString: String!, $limit: Int!, $cursor: String) {
    search(query: $queryString, type: ISSUE, first: $limit, after: $cursor) {
      nodes {
        ... on Issue {
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
}: z.infer<typeof issueQuerySchema>): string => {
  const parts = [`author:${username}`, 'is:issue', 'sort:updated-desc'];
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
}: RawIssue): GHReactionsRow => ({
  ...raw,
  type: 'Issue',
  content: title,
  state: formatState(state),
  repository: repository.nameWithOwner,
  reactions: toReactions(reactionGroups),
  total: totalReactions(reactionGroups),
});

export const fetchIssues = async (
  params: z.infer<typeof issueQuerySchema>,
): Promise<TablePage> => {
  const data = await githubClient.gql<IssueSearchResponse>(query, {
    queryString: buildQueryString(params),
    limit: PAGE_SIZE,
    cursor: params.cursor,
  });
  const { nodes, pageInfo } = data.search;
  return {
    rows: nodes.map(fromNode),
    nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
  };
};

export const api = { fetchIssues };
