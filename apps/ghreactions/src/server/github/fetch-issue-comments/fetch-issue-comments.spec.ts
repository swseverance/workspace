import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RawComment,
  ReactableType,
  ReactionType,
} from '../../../models/github';
import { githubClient } from '../client/client';
import { fetchIssueComments } from './fetch-issue-comments';

beforeEach(() => {
  githubClient.gql = vi.fn();
});

const rawComment: RawComment = {
  id: 'c1',
  url: 'https://github.com/org/repo/issues/1#issuecomment-1',
  body: 'great work',
  updatedAt: '2024-01-01T00:00:00Z',
  reactionGroups: [
    { content: ReactionType.ThumbsUp, reactors: { totalCount: 5 } },
  ],
  issue: { state: 'OPEN', repository: { nameWithOwner: 'org/repo' } },
};

function makeResponse(
  nodes: RawComment[],
  hasNextPage = false,
  endCursor = '',
) {
  return {
    user: {
      issueComments: {
        nodes,
        pageInfo: { hasNextPage, endCursor },
      },
    },
  };
}

describe('fetchIssueComments', () => {
  it('stops paginating once GitHub has no more pages', async () => {
    vi.mocked(githubClient.gql).mockResolvedValueOnce(
      makeResponse([rawComment, { ...rawComment, id: 'c2' }], false),
    );

    const { rows, nextCursor } = await fetchIssueComments({
      username: 'sam',
      type: ReactableType.IssueComment,
      cursor: null,
    });

    expect(githubClient.gql).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(2);
    expect(nextCursor).toBeNull();
  });

  it('returns pageInfo.endCursor as nextCursor when there are more pages', async () => {
    vi.mocked(githubClient.gql).mockResolvedValueOnce(
      makeResponse([rawComment], true, 'page-end-cursor'),
    );

    const { nextCursor } = await fetchIssueComments({
      username: 'sam',
      type: ReactableType.IssueComment,
      cursor: null,
    });

    expect(nextCursor).toBe('page-end-cursor');
  });
});
