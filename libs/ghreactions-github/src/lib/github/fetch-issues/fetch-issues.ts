import { z } from 'zod';
import {
  IssueSearchResponse,
  RawIssue,
  ReactionsFilter,
  SearchSort,
} from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { issueQuerySchema } from '../../validators/validators';
import {
  formatState,
  githubClient,
  toReactions,
  totalReactions,
} from '../client/client';
import { fillPage } from '../client/fill-page';

type SearchParams = z.infer<typeof issueQuerySchema> & { sort?: SearchSort };

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
  sort = 'updated',
}: SearchParams): string => {
  const parts = [`author:${username}`, 'is:issue', `sort:${sort}-desc`];
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

export const fetchIssues = async (params: SearchParams): Promise<TablePage> => {
  const queryString = buildQueryString(params);
  return fillPage(async (limit, cursor) => {
    const data = await githubClient.gql<IssueSearchResponse>(query, {
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

export const api = { fetchIssues };
