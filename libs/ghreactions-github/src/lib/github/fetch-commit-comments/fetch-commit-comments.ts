import { z } from 'zod';
import {
  CommitCommentsResponse,
  RawCommitComment,
} from '../../../models/github';
import { GHReactionsRow, TablePage } from '../../../models/table';
import { commitCommentQuerySchema } from '../../validators/validators';
import {
  githubClient,
  PAGE_SIZE,
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

// github.com/{owner}/{repo}/commit/... still names the repository when the
// commit itself is gone.
const repositoryFromUrl = (url: string) =>
  new URL(url).pathname.split('/').slice(1, 3).join('/');

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
  repository: commit?.repository.nameWithOwner ?? repositoryFromUrl(raw.url),
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

// GitHub returns commit comments oldest first, with no way to reorder them.
const newestQuery = `
  query($login: String!, $limit: Int!) {
    user(login: $login) {
      commitComments(last: $limit) {
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
      }
    }
  }
`;

/** The user's newest `limit` commit comments, newest first. */
export const fetchNewestCommitComments = async (
  username: string,
  limit = PAGE_SIZE,
): Promise<GHReactionsRow[]> => {
  const data = await githubClient.gql<{
    user: { commitComments: { nodes: RawCommitComment[] } };
  }>(newestQuery, {
    login: username,
    limit,
  });
  return data.user.commitComments.nodes.map(fromCommitComment).reverse();
};

export const api = { fetchCommitComments, fetchNewestCommitComments };
