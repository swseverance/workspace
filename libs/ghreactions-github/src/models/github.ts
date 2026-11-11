export enum ReactionsFilter {
  WithReactions = 'WITH_REACTIONS',
  WithoutReactions = 'WITHOUT_REACTIONS',
}

export enum ReactableType {
  CommitComment = 'CommitComment',
  Issue = 'Issue',
  IssueComment = 'IssueComment',
  PullRequest = 'PullRequest',
}

export enum ReactionType {
  ThumbsUp = 'THUMBS_UP',
  ThumbsDown = 'THUMBS_DOWN',
  Laugh = 'LAUGH',
  Hooray = 'HOORAY',
  Confused = 'CONFUSED',
  Heart = 'HEART',
  Rocket = 'ROCKET',
  Eyes = 'EYES',
}

export enum IssueState {
  Open = 'OPEN',
  Closed = 'CLOSED',
}

export enum PullRequestState {
  Open = 'OPEN',
  Closed = 'CLOSED',
}

export type PageInfo = { hasNextPage: boolean; endCursor: string };

export type Connection<T> = { nodes: T[]; pageInfo: PageInfo };

export type ReactionGroup = {
  content: ReactionType;
  reactors: { totalCount: number };
};

export type RawWithReactions = {
  reactionGroups: ReactionGroup[];
};

export type RawIssueLike = RawWithReactions & {
  id: string;
  url: string;
  title: string;
  state: string;
  updatedAt: string;
  repository: { nameWithOwner: string };
};

export type RawIssue = RawIssueLike;

export type RawPullRequest = RawIssueLike;

export type IssuesResponse = {
  user: { issues: Connection<RawIssue> };
};

export type IssueSearchResponse = {
  search: Connection<RawIssue>;
};

export type PullRequestsResponse = {
  user: { pullRequests: Connection<RawPullRequest> };
};

export type PullRequestSearchResponse = {
  search: Connection<RawPullRequest>;
};

export type RawComment = RawWithReactions & {
  id: string;
  url: string;
  body: string;
  updatedAt: string;
  issue: { state: string; repository: { nameWithOwner: string } };
};

export type RawCommitComment = RawWithReactions & {
  id: string;
  url: string;
  body: string;
  updatedAt: string;
  commit: { repository: { nameWithOwner: string } };
};

export type CommitCommentsResponse = {
  user: { commitComments: Connection<RawCommitComment> };
};

export type IssueCommentsResponse = {
  user: { issueComments: Connection<RawComment> };
};
