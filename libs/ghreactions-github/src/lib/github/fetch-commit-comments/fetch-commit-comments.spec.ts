import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RawCommitComment,
  ReactableType,
  ReactionType,
} from '../../../models/github';
import { githubClient } from '../client/client';
import {
  fetchCommitComments,
  fetchNewestCommitComments,
} from './fetch-commit-comments';

beforeEach(() => {
  githubClient.gql = vi.fn();
});

const rawComment: RawCommitComment = {
  id: 'cc1',
  url: 'https://github.com/org/repo/commit/abc123#commitcomment-1',
  body: 'nice commit',
  updatedAt: '2024-01-01T00:00:00Z',
  reactionGroups: [
    { content: ReactionType.ThumbsUp, reactors: { totalCount: 3 } },
  ],
  commit: { repository: { nameWithOwner: 'org/repo' } },
};

function makeResponse(
  nodes: RawCommitComment[],
  hasNextPage = false,
  endCursor = '',
) {
  return {
    user: {
      commitComments: {
        nodes,
        pageInfo: { hasNextPage, endCursor },
      },
    },
  };
}

describe('fetchCommitComments', () => {
  it('maps a raw commit comment to a GHReactionsRow', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([rawComment]));

    const { rows } = await fetchCommitComments({
      username: 'sam',
      type: ReactableType.CommitComment,
      cursor: null,
    });

    expect(rows[0]).toEqual({
      id: 'cc1',
      type: 'Commit Comment',
      url: 'https://github.com/org/repo/commit/abc123#commitcomment-1',
      content: 'nice commit',
      state: '',
      updatedAt: '2024-01-01T00:00:00Z',
      repository: 'org/repo',
      reactions: { THUMBS_UP: 3 },
      total: 3,
    });
  });

  it('truncates long body text', async () => {
    const longBody = 'a'.repeat(200);
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([{ ...rawComment, body: longBody }]),
    );

    const { rows } = await fetchCommitComments({
      username: 'sam',
      type: ReactableType.CommitComment,
      cursor: null,
    });

    expect(rows[0].content.length).toBeLessThanOrEqual(121);
    expect(rows[0].content.endsWith('…')).toBe(true);
  });

  it('returns null nextCursor on the last page', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawComment], false),
    );

    const { nextCursor } = await fetchCommitComments({
      username: 'sam',
      type: ReactableType.CommitComment,
      cursor: null,
    });

    expect(nextCursor).toBeNull();
  });

  it('returns pageInfo.endCursor as nextCursor when there are more pages', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawComment], true, 'page-end-cursor'),
    );

    const { nextCursor } = await fetchCommitComments({
      username: 'sam',
      type: ReactableType.CommitComment,
      cursor: null,
    });

    expect(nextCursor).toBe('page-end-cursor');
  });

  it('passes cursor to gql when provided', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    await fetchCommitComments({
      username: 'sam',
      type: ReactableType.CommitComment,
      cursor: 'start-cursor',
    });

    expect(githubClient.gql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cursor: 'start-cursor' }),
    );
  });
});

describe('fetchNewestCommitComments', () => {
  const comment = (id: string, url: string): RawCommitComment => ({
    ...rawComment,
    id,
    url,
  });

  it('requests the last 100 comments for the user', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));
    await fetchNewestCommitComments('octocat');
    const [query, variables] = vi.mocked(githubClient.gql).mock.calls[0];
    expect(query).toContain('commitComments(last: $limit)');
    expect(variables).toEqual({ login: 'octocat', limit: 100 });
  });

  it('takes the repository from the URL when the commit is gone', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([
        {
          ...rawComment,
          url: 'https://github.com/expressjs/express/commit/0c85e9d#commitcomment-1',
          commit: null,
        },
      ]),
    );
    const [row] = await fetchNewestCommitComments('octocat');
    expect(row.repository).toBe('expressjs/express');
  });

  it('returns rows newest first', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([comment('old', 'u1'), comment('new', 'u2')]),
    );
    const rows = await fetchNewestCommitComments('octocat');
    expect(rows.map((r) => r.id)).toEqual(['new', 'old']);
    expect(rows[0]).toMatchObject({ type: 'Commit Comment', total: 3 });
  });
});
