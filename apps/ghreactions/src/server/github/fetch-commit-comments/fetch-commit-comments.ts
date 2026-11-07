import { z } from 'zod';
import {
  CommitCommentsResponse,
  RawCommitComment,
} from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { commitCommentQuerySchema } from '../../../validators/validators';
import {
  githubClient,
  PAGE_SIZE,
  toReactions,
  totalReactions,
  truncate,
} from '../client/client';

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
  const data = await githubClient.gql<CommitCommentsResponse>(query, {
    login: username,
    limit: PAGE_SIZE,
    cursor,
  });
  const { nodes, pageInfo } = data.user.commitComments;
  return {
    rows: nodes.map(fromCommitComment),
    nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
  };
};

export const api = { fetchCommitComments };
