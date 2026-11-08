import { z } from 'zod';
import {
  CommitCommentsResponse,
  RawCommitComment,
} from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { commitCommentQuerySchema } from '../../../validators/validators';
import {
  githubClient,
  toReactions,
  totalReactions,
  truncate,
} from '../client/client';
import { fillPage } from '../client/fill-page';

const query = `
  query($login: String!, $limit: Int!, $cursor: String) {
    user(login: $login) {
      commitComments(first: $limit, after: $cursor) {
        nodes {
          id
          url
          body
          updatedAt
          reactionGroups { content reactors { totalCount } }
          commit {
            repository { nameWithOwner }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const fromCommitComment = ({
  reactionGroups,
  body,
  commit,
  ...raw
}: RawCommitComment): GHReactionsRow => ({
  ...raw,
  type: 'Commit Comment',
  content: truncate(body),
  state: '',
  repository: commit.repository.nameWithOwner,
  reactions: toReactions(reactionGroups),
  total: totalReactions(reactionGroups),
});

export const fetchCommitComments = async ({
  username,
  cursor,
}: z.infer<typeof commitCommentQuerySchema>): Promise<TablePage> => {
  return fillPage(async (limit, after) => {
    const data = await githubClient.gql<CommitCommentsResponse>(query, {
      login: username,
      limit,
      cursor: after,
    });
    const { nodes, pageInfo } = data.user.commitComments;
    return {
      rows: nodes.map(fromCommitComment),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }, cursor);
};

export const api = { fetchCommitComments };
