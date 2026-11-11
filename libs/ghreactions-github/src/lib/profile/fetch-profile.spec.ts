import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNotFoundError } from '../../models/errors';
import { GHReactionsRow } from '../../models/table';
import { api as commitCommentsApi } from '../github/fetch-commit-comments/fetch-commit-comments';
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
const now = new Date('2026-11-11T12:00:00Z');

beforeEach(() => {
  issueCommentsApi.fetchIssueComments = vi
    .fn()
    .mockResolvedValue(page([row('ic1', 1), row('ic2', 5)]));
  commitCommentsApi.fetchNewestCommitComments = vi
    .fn()
    .mockResolvedValue([row('cc1', 0), row('cc2', 2)]);
  issuesApi.fetchIssues = vi.fn().mockResolvedValue(page([row('i1', 9)]));
  pullRequestsApi.fetchPullRequests = vi
    .fn()
    .mockResolvedValue(page([row('p1', 4)]));
});

describe('fetchProfile', () => {
  it('sorts every list by total reactions', async () => {
    const profile = await fetchProfile('octocat', now);
    expect(profile).toMatchObject({
      username: 'octocat',
      refreshedAt: '2026-11-11T12:00:00.000Z',
      status: 'ok',
    });
    expect(profile.issueComments.map((r) => r.id)).toEqual(['ic2', 'ic1']);
    expect(profile.commitComments.map((r) => r.id)).toEqual(['cc2', 'cc1']);
    expect(profile.issues.map((r) => r.id)).toEqual(['i1']);
    expect(profile.pullRequests.map((r) => r.id)).toEqual(['p1']);
  });

  it('asks GitHub to sort issues and PRs by reactions', async () => {
    await fetchProfile('octocat', now);
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
    const profile = await fetchProfile('ghost', now);
    expect(profile).toEqual({
      username: 'ghost',
      refreshedAt: '2026-11-11T12:00:00.000Z',
      status: 'not_found',
      issues: [],
      pullRequests: [],
      issueComments: [],
      commitComments: [],
    });
    expect(issuesApi.fetchIssues).not.toHaveBeenCalled();
  });

  it('rethrows other errors', async () => {
    issuesApi.fetchIssues = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(fetchProfile('octocat', now)).rejects.toThrow('boom');
  });
});
