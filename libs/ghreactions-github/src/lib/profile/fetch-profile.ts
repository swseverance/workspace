import { UserNotFoundError } from '../../models/errors';
import { ReactableType } from '../../models/github';
import { ProfileFields } from '../../models/profile';
import { GHReactionsRow } from '../../models/table';
import { api as issueCommentsApi } from '../github/fetch-issue-comments/fetch-issue-comments';
import { api as issuesApi } from '../github/fetch-issues/fetch-issues';
import { api as pullRequestsApi } from '../github/fetch-pull-requests/fetch-pull-requests';

/** Rows with reactions, most first. */
const reacted = (rows: GHReactionsRow[]) =>
  rows.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);

const sumReactions = (rows: GHReactionsRow[]) =>
  rows.reduce((sum, row) => sum + row.total, 0);

/**
 * Builds a user's profile from three GitHub calls (a few more if GitHub
 * returns short pages). Issues and PRs come back sorted by reactions; GitHub
 * can't sort comments that way, so the newest are sorted here instead.
 *
 * By default the calls run one at a time, to stay clear of GitHub's
 * secondary rate limits: right for refreshProfile, which runs all day with
 * nobody waiting. `parallel` runs them together for a visitor who is
 * waiting, which takes as long as the slowest call instead of all three
 * (about a third to a half of the time, measured).
 */
export async function fetchProfile(
  username: string,
  { parallel = false } = {},
): Promise<ProfileFields> {
  const fetchIssueComments = () =>
    issueCommentsApi.fetchIssueComments({
      username,
      type: ReactableType.IssueComment,
      cursor: null,
    });
  const fetchIssues = () =>
    issuesApi.fetchIssues({
      username,
      type: ReactableType.Issue,
      cursor: null,
      sort: 'reactions',
    });
  const fetchPullRequests = () =>
    pullRequestsApi.fetchPullRequests({
      username,
      type: ReactableType.PullRequest,
      cursor: null,
      sort: 'reactions',
    });

  try {
    let issueComments, issues, pullRequests;
    if (parallel) {
      [issueComments, issues, pullRequests] = await Promise.all([
        fetchIssueComments(),
        fetchIssues(),
        fetchPullRequests(),
      ]);
    } else {
      // The user-scoped call goes first, so a missing user fails fast.
      issueComments = await fetchIssueComments();
      issues = await fetchIssues();
      pullRequests = await fetchPullRequests();
    }

    const lists = {
      issues: reacted(issues.rows),
      pullRequests: reacted(pullRequests.rows),
      issueComments: reacted(issueComments.rows),
    };
    const reactions = {
      issues: sumReactions(lists.issues),
      pullRequests: sumReactions(lists.pullRequests),
      issueComments: sumReactions(lists.issueComments),
    };

    return {
      username,
      status: 'ok',
      ...lists,
      counts: {
        issues: lists.issues.length,
        pullRequests: lists.pullRequests.length,
        issueComments: lists.issueComments.length,
      },
      reactions,
      totalReactions:
        reactions.issues + reactions.pullRequests + reactions.issueComments,
    };
  } catch (err) {
    if (!(err instanceof UserNotFoundError)) throw err;
    return {
      username,
      status: 'not_found',
      issues: [],
      pullRequests: [],
      issueComments: [],
      counts: { issues: 0, pullRequests: 0, issueComments: 0 },
      reactions: { issues: 0, pullRequests: 0, issueComments: 0 },
      totalReactions: 0,
    };
  }
}

/** Object wrapper so consumers can monkey-patch it in tests. */
export const profileApi = { fetchProfile };
