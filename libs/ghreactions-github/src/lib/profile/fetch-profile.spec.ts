import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNotFoundError } from '../../models/errors';
import { GHReactionsRow } from '../../models/table';
import { api as issueCommentsApi } from '../github/fetch-issue-comments/fetch-issue-comments';
import { api as issuesApi } from '../github/fetch-issues/fetch-issues';
import { api as pullRequestsApi } from '../github/fetch-pull-requests/fetch-pull-requests';
import { fetchProfile } from './fetch-profile';

const row = (id: string, total: number): GHReactionsRow => ({
  type: 'Issue',
  id,
  url: `https://github.com/org/repo/issues/${id}`,
  content: id,
  state: 'Open',
  updatedAt: '2026-01-01T00:00:00Z',
  reactions: {},
  total,
  repository: 'org/repo',
});
const page = (rows: GHReactionsRow[]) => ({ rows, nextCursor: null });

beforeEach(() => {
  issueCommentsApi.fetchIssueComments = vi
    .fn()
    .mockResolvedValue(page([row('ic1', 1), row('ic0', 0), row('ic2', 5)]));
  issuesApi.fetchIssues = vi.fn().mockResolvedValue(page([row('i1', 9)]));
  pullRequestsApi.fetchPullRequests = vi
    .fn()
    .mockResolvedValue(page([row('p1', 4)]));
});

describe('fetchProfile', () => {
  it('keeps rows with reactions, most first, and counts them', async () => {
    const profile = await fetchProfile('octocat');
    expect(profile).toMatchObject({
      username: 'octocat',
      status: 'ok',
    });
    expect(profile.issueComments.map((r) => r.id)).toEqual(['ic2', 'ic1']);
    expect(profile.issues.map((r) => r.id)).toEqual(['i1']);
    expect(profile.pullRequests.map((r) => r.id)).toEqual(['p1']);
    expect(profile.counts).toEqual({
      issues: 1,
      pullRequests: 1,
      issueComments: 2,
    });
    // 9 + 4 + 5 + 1; the comment with no reactions adds nothing.
    expect(profile.totalReactions).toBe(19);
  });

  it('asks GitHub to sort issues and PRs by reactions', async () => {
    await fetchProfile('octocat');
    expect(issuesApi.fetchIssues).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'octocat', sort: 'reactions' }),
    );
    expect(pullRequestsApi.fetchPullRequests).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'octocat', sort: 'reactions' }),
    );
  });

  it('returns an empty not_found profile for a missing user', async () => {
    issueCommentsApi.fetchIssueComments = vi
      .fn()
      .mockRejectedValue(new UserNotFoundError());
    const profile = await fetchProfile('ghost');
    expect(profile).toEqual({
      username: 'ghost',
      status: 'not_found',
      issues: [],
      pullRequests: [],
      issueComments: [],
      counts: { issues: 0, pullRequests: 0, issueComments: 0 },
      totalReactions: 0,
    });
    expect(issuesApi.fetchIssues).not.toHaveBeenCalled();
  });

  it('rethrows other errors', async () => {
    issuesApi.fetchIssues = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(fetchProfile('octocat')).rejects.toThrow('boom');
  });
});
