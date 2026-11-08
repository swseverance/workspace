import { z } from 'zod';
import { IssueCommentsResponse, RawComment } from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { issueCommentQuerySchema } from '../../../validators/validators';
import {
  formatState,
  githubClient,
  toReactions,
  totalReactions,
  truncate,
} from '../client/client';
import { fillPage } from '../client/fill-page';

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
  return fillPage(async (limit, after) => {
    const data = await githubClient.gql<IssueCommentsResponse>(query, {
      login: username,
      limit,
      cursor: after,
    });
    const { nodes, pageInfo } = data.user.issueComments;
    return {
      rows: nodes.map(fromComment),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }, cursor);
};

export const api = { fetchIssueComments };
