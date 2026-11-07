import { z } from 'zod';
import { IssueCommentsResponse, RawComment } from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { issueCommentQuerySchema } from '../../../validators/validators';
import {
  formatState,
  githubClient,
  PAGE_SIZE,
  toReactions,
  totalReactions,
  truncate,
} from '../client/client';

const query = `
  query($login: String!, $limit: Int!, $cursor: String) {
    user(login: $login) {
      issueComments(first: $limit, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id
          url
          body
          updatedAt
          reactionGroups { content reactors { totalCount } }
          issue {
            state
            repository { nameWithOwner }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const fromComment = ({
  reactionGroups,
  body,
  issue,
  ...raw
}: RawComment): GHReactionsRow => ({
  ...raw,
  type: raw.url.includes('/pull/') ? 'Pull Request Comment' : 'Issue Comment',
  content: truncate(body),
  state: formatState(issue.state),
  repository: issue.repository.nameWithOwner,
  reactions: toReactions(reactionGroups),
  total: totalReactions(reactionGroups),
});

export const fetchIssueComments = async ({
  username,
  cursor,
}: z.infer<typeof issueCommentQuerySchema>): Promise<TablePage> => {
  const data = await githubClient.gql<IssueCommentsResponse>(query, {
    login: username,
    limit: PAGE_SIZE,
    cursor,
  });
  const { nodes, pageInfo } = data.user.issueComments;
  return {
    rows: nodes.map(fromComment),
    nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
  };
};

export const api = { fetchIssueComments };
