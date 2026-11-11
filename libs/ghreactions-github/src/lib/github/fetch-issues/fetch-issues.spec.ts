import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IssueState,
  RawIssue,
  ReactableType,
  ReactionsFilter,
  ReactionType,
} from '../../../models/github';
import { githubClient } from '../client/client';
import { buildQueryString, fetchIssues } from './fetch-issues';

beforeEach(() => {
  githubClient.gql = vi.fn();
});

const rawNode: RawIssue = {
  id: 'I_1',
  url: 'https://github.com/org/repo/issues/1',
  title: 'Fix the bug',
  state: 'OPEN',
  updatedAt: '2024-01-01T00:00:00Z',
  reactionGroups: [
    { content: ReactionType.ThumbsUp, reactors: { totalCount: 3 } },
  ],
  repository: { nameWithOwner: 'org/repo' },
};

function makeResponse(nodes: RawIssue[], hasNextPage = false, endCursor = '') {
  return { search: { nodes, pageInfo: { hasNextPage, endCursor } } };
}

const opts = {
  username: 'sam',
  type: ReactableType.Issue as const,
  cursor: null,
  state: [IssueState.Open],
};

describe('fetchIssues', () => {
  it('maps a raw node to a GHReactionsRow', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([rawNode]));

    const { rows } = await fetchIssues(opts);

    expect(rows[0]).toEqual({
      id: 'I_1',
      type: 'Issue',
      url: 'https://github.com/org/repo/issues/1',
      content: 'Fix the bug',
      state: 'Open',
      updatedAt: '2024-01-01T00:00:00Z',
      repository: 'org/repo',
      reactions: { THUMBS_UP: 3 },
      total: 3,
    });
  });

  it('omits zero-count reactions', async () => {
    const node: RawIssue = {
      ...rawNode,
      reactionGroups: [
        { content: ReactionType.ThumbsUp, reactors: { totalCount: 2 } },
        { content: ReactionType.Heart, reactors: { totalCount: 0 } },
      ],
    };
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([node]));

    const { rows } = await fetchIssues(opts);

    expect(rows[0].reactions).toEqual({ THUMBS_UP: 2 });
  });

  it('returns empty rows when there are no results', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    const { rows, nextCursor } = await fetchIssues(opts);

    expect(rows).toEqual([]);
    expect(nextCursor).toBeNull();
  });

  it('returns nextCursor when there is another page', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawNode], true, 'cursor123'),
    );

    const { nextCursor } = await fetchIssues(opts);

    expect(nextCursor).toBe('cursor123');
  });

  it('returns null nextCursor on the last page', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawNode], false, 'cursor123'),
    );

    const { nextCursor } = await fetchIssues(opts);

    expect(nextCursor).toBeNull();
  });

  it('passes queryString and cursor to gql', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    await fetchIssues({
      username: 'swseverance',
      type: ReactableType.Issue as const,
      cursor: 'cursor-abc',
      state: [IssueState.Open],
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

    await fetchIssues(opts);

    expect(githubClient.gql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cursor: null }),
    );
  });

  it('passes states as qualifiers in queryString', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(makeResponse([]));

    await fetchIssues({
      username: 'sam',
      type: ReactableType.Issue as const,
      cursor: null,
      state: [IssueState.Open, IssueState.Closed],
    });

    expect(githubClient.gql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        queryString: expect.not.stringContaining('state:'),
      }),
    );
  });

  it('maps multiple nodes', async () => {
    const second: RawIssue = { ...rawNode, id: 'I_2', title: 'Another issue' };
    vi.mocked(githubClient.gql).mockResolvedValue(
      makeResponse([rawNode, second]),
    );

    const { rows } = await fetchIssues(opts);

    expect(rows).toHaveLength(2);
    expect(rows[1].content).toBe('Another issue');
  });
});

describe('buildQueryString', () => {
  const base = {
    username: 'octocat',
    type: ReactableType.Issue,
    cursor: null,
  } as const;

  it('includes author and is:issue', () => {
    const result = buildQueryString({ ...base, state: [IssueState.Open] });
    expect(result).toContain('author:octocat');
    expect(result).toContain('is:issue');
  });

  it('includes a single state as a qualifier', () => {
    const result = buildQueryString({ ...base, state: [IssueState.Open] });
    expect(result).toContain('state:open');
  });

  it('omits state qualifier when multiple states are provided', () => {
    const result = buildQueryString({
      ...base,
      state: [IssueState.Open, IssueState.Closed],
    });
    expect(result).not.toContain('state:');
  });

  it('omits state qualifiers when state is undefined', () => {
    const result = buildQueryString({ ...base });
    expect(result).not.toContain('is:open');
    expect(result).not.toContain('is:closed');
  });

  it('includes sort:updated-desc', () => {
    const result = buildQueryString({ ...base, state: [IssueState.Open] });
    expect(result).toContain('sort:updated-desc');
  });

  it('includes reactions:>0 when reactions is [WithReactions]', () => {
    const result = buildQueryString({
      ...base,
      state: [IssueState.Open],
      reactions: [ReactionsFilter.WithReactions],
    });
    expect(result).toContain('reactions:>0');
  });

  it('includes reactions:0 when reactions is [WithoutReactions]', () => {
    const result = buildQueryString({
      ...base,
      state: [IssueState.Open],
      reactions: [ReactionsFilter.WithoutReactions],
    });
    expect(result).toContain('reactions:0');
  });

  it('omits reactions qualifier when reactions is undefined', () => {
    const result = buildQueryString({ ...base, state: [IssueState.Open] });
    expect(result).not.toContain('reactions:');
  });

  it('omits reactions qualifier when both values are passed', () => {
    const result = buildQueryString({
      ...base,
      state: [IssueState.Open],
      reactions: [
        ReactionsFilter.WithReactions,
        ReactionsFilter.WithoutReactions,
      ],
    });
    expect(result).not.toContain('reactions:');
  });
});
