import { serializeError } from '@org/server';
import { RequestHandler } from 'express';
import * as logger from 'firebase-functions/logger';
import { RateLimitError, UserNotFoundError } from '../../models/errors';
import { ReactableType } from '../../models/github';
import { tableQuerySchema } from '../../validators/validators';
import { analytics } from '../analytics/analytics';
import { api as commitCommentsApi } from '../github/fetch-commit-comments/fetch-commit-comments';
import { api as issueCommentsApi } from '../github/fetch-issue-comments/fetch-issue-comments';
import { api as issuesApi } from '../github/fetch-issues/fetch-issues';
import { api as pullRequestsApi } from '../github/fetch-pull-requests/fetch-pull-requests';
import { rateLimit } from '../github/rate-limit/rate-limit';

export const tableHandler: RequestHandler = async (req, res) => {
  const parsed = tableQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
    return;
  }

  const data = parsed.data;

  try {
    await rateLimit.checkRateLimit();

    let page;
    switch (data.type) {
      case ReactableType.CommitComment:
        page = await commitCommentsApi.fetchCommitComments(data);
        break;
      case ReactableType.IssueComment:
        page = await issueCommentsApi.fetchIssueComments(data);
        break;
      case ReactableType.Issue:
        page = await issuesApi.fetchIssues(data);
        break;
      case ReactableType.PullRequest:
        page = await pullRequestsApi.fetchPullRequests(data);
        break;
    }

    // A cursor means the user is scrolling an existing search, not starting
    // one. Awaited before responding because Cloud Run may throttle CPU once
    // the response is sent.
    if (!data.cursor) await analytics.recordSearch(data.username);

    res.json(page);
  } catch (err) {
    if (err instanceof RateLimitError) {
      const seconds = Math.max(1, err.retryAt - Math.floor(Date.now() / 1000));
      const minutes = Math.ceil(seconds / 60);
      res
        .set('Retry-After', String(seconds))
        .status(429)
        .json({
          message: `GitHub's rate limit has been reached. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        });
      return;
    }

    if (err instanceof UserNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }

    // Upstream error text (e.g. "Bad credentials") is for us, not the user.
    logger.error('[table]', serializeError(err));
    res.status(500).json({ message: 'Internal server error' });
  }
};
