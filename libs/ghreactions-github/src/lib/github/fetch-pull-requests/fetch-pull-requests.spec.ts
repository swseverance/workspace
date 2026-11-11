import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PullRequestState,
  RawPullRequest,
  ReactableType,
  ReactionsFilter,
  ReactionType,
} from '../../../models/github';
import { githubClient } from '../client/client';
import { buildQueryString, fetchPullRequests } from './fetch-pull-requests';

beforeEach(() => {
  githubClient.gql = vi.fn();
});

const rawNode: RawPullRequest = {
  id: 'PR_1',
  url: 'https://github.com/org/repo/pull/1',
  title: 'Add feature',
  state: 'MERGED',
  updatedAt: '2024-01-01T00:00:00Z',
  reactionGroups: [
    { content: ReactionType.ThumbsUp, reactors: { totalCount: 4 } },
  ],
  repository: { nameWithOwner: 'org/repo' },
};

function makeResponse(
  nodes: RawPullRequest[],
  hasNextPage = false,
  endCursor = '',
) {
  return { search: { nodes, pageInfo: { hasNextPage, endCursor } } };
}

const opts = {
  username: 'sam',
  type: ReactableType.PullRequest as const,
  cursor: null,
  state: [PullRequestState.Open],
};

describe('fetchPullRequests', () => {
  it('maps a raw node to a GHReactionsRow', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([rawNode]));

    const { rows } = await fetchPullRequests(opts);

    expect(rows[0]).toEqual({
      id: 'PR_1',
      type: 'Pull Request',
      url: 'https://github.com/org/repo/pull/1',
      content: 'Add feature',
      state: 'Merged',
      updatedAt: '2024-01-01T00:00:00Z',
      repository: 'org/repo',
      reactions: { THUMBS_UP: 4 },
      total: 4,
    });
  });

  it('omits zero-count reactions', async () => {
    const node: RawPullRequest = {
      ...rawNode,
      reactionGroups: [
        { content: ReactionType.ThumbsUp, reactors: { totalCount: 2 } },
        { content: ReactionType.Heart, reactors: { totalCount: 0 } },
      ],
    };
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([node]));

    const { rows } = await fetchPullRequests(opts);

    expect(rows[0].reactions).toEqual({ THUMBS_UP: 2 });
  });

  it('returns empty rows when there are no results', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    const { rows, nextCursor } = await fetchPullRequests(opts);

    expect(rows).toEqual([]);
    expect(nextCursor).toBeNull();
  });

  it('returns nextCursor when there is another page', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawNode], true, 'cursor123'),
    );

    const { nextCursor } = await fetchPullRequests(opts);

    expect(nextCursor).toBe('cursor123');
  });

  it('returns null nextCursor on the last page', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawNode], false, 'cursor123'),
    );

    const { nextCursor } = await fetchPullRequests(opts);

    expect(nextCursor).toBeNull();
  });

  it('passes queryString and cursor to gql', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    await fetchPullRequests({
      username: 'swseverance',
      type: ReactableType.PullRequest,
      cursor: 'cursor-abc',
      state: [PullRequestState.Open],
    });

    expect(githubClient.gql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        queryString: expect.stringContaining('author:swseverance'),
        cursor: 'cursor-abc',
      }),
    );
  });

  it('passes null cursor when no cursor provided', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    await fetchPullRequests(opts);

    expect(githubClient.gql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cursor: null }),
    );
  });

  it('passes states as qualifiers in queryString', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    await fetchPullRequests({
      username: 'sam',
      type: ReactableType.PullRequest,
      cursor: null,
      state: [PullRequestState.Open, PullRequestState.Closed],
    });

    expect(githubClient.gql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        queryString: expect.not.stringContaining('state:'),
      }),
    );
  });

  it('maps multiple nodes', async () => {
    const second: RawPullRequest = { ...rawNode, id: 'PR_2', title: 'Fix bug' };
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawNode, second]),
    );

    const { rows } = await fetchPullRequests(opts);

    expect(rows).toHaveLength(2);
    expect(rows[1].content).toBe('Fix bug');
  });
});

describe('buildQueryString', () => {
  const base = {
    username: 'octocat',
    type: ReactableType.PullRequest,
    cursor: null,
  } as const;

  it('includes author and is:pr', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
    });
    expect(result).toContain('author:octocat');
    expect(result).toContain('is:pr');
  });

  it('includes a single state as a qualifier', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
    });
    expect(result).toContain('state:open');
  });

  it('omits state qualifier when multiple states are provided', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open, PullRequestState.Closed],
    });
    expect(result).not.toContain('state:');
  });

  it('omits state qualifiers when state is undefined', () => {
    const result = buildQueryString({ ...base });
    expect(result).not.toContain('is:open');
    expect(result).not.toContain('is:merged');
  });

  it('sorts by reactions when asked', () => {
    const result = buildQueryString({ ...base, sort: 'reactions' });
    expect(result).toContain('sort:reactions-desc');
    expect(result).not.toContain('sort:updated-desc');
  });

  it('includes sort:updated-desc', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
    });
    expect(result).toContain('sort:updated-desc');
  });

  it('includes reactions:>0 when reactions is [WithReactions]', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
      reactions: [ReactionsFilter.WithReactions],
    });
    expect(result).toContain('reactions:>0');
  });

  it('includes reactions:0 when reactions is [WithoutReactions]', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
      reactions: [ReactionsFilter.WithoutReactions],
    });
    expect(result).toContain('reactions:0');
  });

  it('omits reactions qualifier when reactions is undefined', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
    });
    expect(result).not.toContain('reactions:');
  });

  it('omits reactions qualifier when both values are passed', () => {
    const result = buildQueryString({
      ...base,
      state: [PullRequestState.Open],
      reactions: [
        ReactionsFilter.WithReactions,
        ReactionsFilter.WithoutReactions,
      ],
    });
    expect(result).not.toContain('reactions:');
  });
});
