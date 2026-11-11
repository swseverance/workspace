import { UserNotFoundError } from '../../models/errors';
import { ReactableType } from '../../models/github';
import { Profile } from '../../models/profile';
import { GHReactionsRow } from '../../models/table';
import { api as commitCommentsApi } from '../github/fetch-commit-comments/fetch-commit-comments';
import { api as issueCommentsApi } from '../github/fetch-issue-comments/fetch-issue-comments';
import { api as issuesApi } from '../github/fetch-issues/fetch-issues';
import { api as pullRequestsApi } from '../github/fetch-pull-requests/fetch-pull-requests';

const byTotal = (rows: GHReactionsRow[]) =>
  [...rows].sort((a, b) => b.total - a.total);

/**
 * Builds a user's profile from four GitHub calls (a few more if GitHub
 * returns short pages). Issues and PRs come back sorted by reactions; GitHub
 * can't sort comments that way, so the newest are sorted here instead.
 */
export async function fetchProfile(
  username: string,
  now = new Date(),
): Promise<Profile> {
  const base = { username, refreshedAt: now.toISOString() };
  try {
    // Calls run one at a time to stay clear of GitHub's secondary rate
    // limits. The user-scoped call goes first, so a missing user fails fast.
    const issueComments = await issueCommentsApi.fetchIssueComments({
      username,
      type: ReactableType.IssueComment,
      cursor: null,
    });
    const commitComments =
      await commitCommentsApi.fetchNewestCommitComments(username);
    const issues = await issuesApi.fetchIssues({
      username,
      type: ReactableType.Issue,
      cursor: null,
      sort: 'reactions',
    });
    const pullRequests = await pullRequestsApi.fetchPullRequests({
      username,
      type: ReactableType.PullRequest,
      cursor: null,
      sort: 'reactions',
    });

    return {
      ...base,
      status: 'ok',
      issues: byTotal(issues.rows),
      pullRequests: byTotal(pullRequests.rows),
      issueComments: byTotal(issueComments.rows),
      commitComments: byTotal(commitComments),
    };
  } catch (err) {
    if (!(err instanceof UserNotFoundError)) throw err;
    return {
      ...base,
      status: 'not_found',
      issues: [],
      pullRequests: [],
      issueComments: [],
      commitComments: [],
    };
  }
}

/** Object wrapper so consumers can monkey-patch it in tests. */
export const profileApi = { fetchProfile };
