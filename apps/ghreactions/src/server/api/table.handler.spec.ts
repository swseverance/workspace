import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitError, UserNotFoundError } from '../../models/errors';
import { ReactableType } from '../../models/github';
import { api as commitCommentsApi } from '../github/fetch-commit-comments/fetch-commit-comments';
import { api as issueCommentsApi } from '../github/fetch-issue-comments/fetch-issue-comments';
import { api as issuesApi } from '../github/fetch-issues/fetch-issues';
import { api as pullRequestsApi } from '../github/fetch-pull-requests/fetch-pull-requests';
import { rateLimit } from '../github/rate-limit/rate-limit';
import { tableHandler } from './table.handler';

const { mockSet, mockDoc } = vi.hoisted(() => {
  const mockSet = vi.fn().mockResolvedValue(undefined);
  const mockDoc = vi.fn().mockReturnValue({ set: mockSet });
  return { mockSet, mockDoc };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn().mockReturnValue({ doc: mockDoc }),
}));

function makeReq(query: Record<string, unknown>) {
  return { query } as any;
}

function makeRes() {
  const res = { set: vi.fn(), status: vi.fn(), json: vi.fn() } as any;
  res.set.mockReturnValue(res);
  res.status.mockReturnValue(res);
  return res;
}

const page = { rows: [], nextCursor: null };

beforeEach(() => {
  mockDoc.mockReturnValue({ set: mockSet });
  mockSet.mockResolvedValue(undefined);
  mockSet.mockClear();
  mockDoc.mockClear();

  rateLimit.checkRateLimit = vi.fn().mockResolvedValue(undefined);
  commitCommentsApi.fetchCommitComments = vi.fn().mockResolvedValue(page);
  issuesApi.fetchIssues = vi.fn().mockResolvedValue(page);
  issueCommentsApi.fetchIssueComments = vi.fn().mockResolvedValue(page);
  pullRequestsApi.fetchPullRequests = vi.fn().mockResolvedValue(page);
});

describe('tableHandler', () => {
  describe('input validation', () => {
    it('returns 400 when username is missing', async () => {
      const res = makeRes();
      await tableHandler(makeReq({ type: ReactableType.Issue }), res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'username is required',
      });
    });

    it('returns 400 when username is blank', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({ username: '   ', type: ReactableType.Issue }),
        res,
        vi.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when username is an array', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({
          username: ['Swseverance', 'bob'],
          type: ReactableType.Issue,
        }),
        res,
        vi.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when type is missing', async () => {
      const res = makeRes();
      await tableHandler(makeReq({ username: 'Swseverance' }), res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'type is required' });
    });

    it('returns 400 for unsupported type', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({ username: 'Swseverance', type: 'Gist' }),
        res,
        vi.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'unsupported type: Gist',
      });
    });
  });

  describe('routing', () => {
    it('delegates to fetchCommitComments for CommitComment type', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({ username: 'Swseverance', type: ReactableType.CommitComment }),
        res,
        vi.fn(),
      );
      expect(commitCommentsApi.fetchCommitComments).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'Swseverance',
          type: ReactableType.CommitComment,
        }),
      );
      expect(issuesApi.fetchIssues).not.toHaveBeenCalled();
      expect(issueCommentsApi.fetchIssueComments).not.toHaveBeenCalled();
    });

    it('delegates to fetchIssues for Issue type', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );
      expect(issuesApi.fetchIssues).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: ['OPEN'],
        }),
      );
      expect(issueCommentsApi.fetchIssueComments).not.toHaveBeenCalled();
    });

    it('delegates to fetchIssueComments for IssueComment type', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({ username: 'Swseverance', type: ReactableType.IssueComment }),
        res,
        vi.fn(),
      );
      expect(issueCommentsApi.fetchIssueComments).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'Swseverance',
          type: ReactableType.IssueComment,
        }),
      );
      expect(issuesApi.fetchIssues).not.toHaveBeenCalled();
    });

    it('delegates to fetchPullRequests for PullRequest type', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.PullRequest,
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );
      expect(pullRequestsApi.fetchPullRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'Swseverance',
          type: ReactableType.PullRequest,
          state: ['OPEN'],
        }),
      );
      expect(issuesApi.fetchIssues).not.toHaveBeenCalled();
      expect(issueCommentsApi.fetchIssueComments).not.toHaveBeenCalled();
    });

    it('passes trimmed login to fetch functions', async () => {
      await tableHandler(
        makeReq({
          username: '  Swseverance  ',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        makeRes(),
        vi.fn(),
      );
      expect(issuesApi.fetchIssues).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'Swseverance', state: ['OPEN'] }),
      );
    });

    it('passes cursor when provided', async () => {
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          cursor: 'abc123',
          state: 'OPEN',
        }),
        makeRes(),
        vi.fn(),
      );
      expect(issuesApi.fetchIssues).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'Swseverance',
          cursor: 'abc123',
          state: ['OPEN'],
        }),
      );
    });

    it('returns 400 when cursor is not a string', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          cursor: ['a', 'b'],
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('wraps a single state string in an array', async () => {
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        makeRes(),
        vi.fn(),
      );
      expect(issuesApi.fetchIssues).toHaveBeenCalledWith(
        expect.objectContaining({ state: ['OPEN'] }),
      );
    });

    it('passes a state array through as-is', async () => {
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: ['OPEN', 'CLOSED'],
        }),
        makeRes(),
        vi.fn(),
      );
      expect(issuesApi.fetchIssues).toHaveBeenCalledWith(
        expect.objectContaining({ state: ['OPEN', 'CLOSED'] }),
      );
    });

    it('returns 400 when state is not a valid value', async () => {
      const res = makeRes();
      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: 'INVALID',
        }),
        res,
        vi.fn(),
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('upserts user with trimmed username after successful fetch', async () => {
      await tableHandler(
        makeReq({
          username: '  Swseverance  ',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        makeRes(),
        vi.fn(),
      );
      expect(mockDoc).toHaveBeenCalledWith('users/swseverance');
      expect(mockSet).toHaveBeenCalledWith(
        { username: 'swseverance' },
        { merge: true },
      );
    });

    it('returns the page from the fetch function', async () => {
      const result = { rows: [{ id: '1' }], nextCursor: 'next' };
      issuesApi.fetchIssues = vi.fn().mockResolvedValue(result as any);
      const res = makeRes();

      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );

      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('error handling', () => {
    it('returns 429 when rate limited', async () => {
      rateLimit.checkRateLimit = vi
        .fn()
        .mockRejectedValue(new RateLimitError());
      const res = makeRes();

      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Rate limited by GitHub, please try again later',
      });
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('returns empty page when user is not found', async () => {
      const error = new UserNotFoundError();
      issuesApi.fetchIssues = vi.fn().mockRejectedValue(error);
      const res = makeRes();

      await tableHandler(
        makeReq({
          username: 'ghost',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('returns 500 for unexpected errors', async () => {
      issuesApi.fetchIssues = vi
        .fn()
        .mockRejectedValue(new Error('something went wrong'));
      const res = makeRes();

      await tableHandler(
        makeReq({
          username: 'Swseverance',
          type: ReactableType.Issue,
          state: 'OPEN',
        }),
        res,
        vi.fn(),
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'something went wrong',
      });
      expect(mockSet).not.toHaveBeenCalled();
    });
  });
});
