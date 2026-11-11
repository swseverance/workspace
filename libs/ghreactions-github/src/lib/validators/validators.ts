import { z } from 'zod';
import {
  IssueState,
  PullRequestState,
  ReactableType,
  ReactionsFilter,
} from '../models/github';

export const usernameField = z
  .string({ error: 'username is required' })
  .trim()
  .min(1, 'username is required');

export const cursorField = z.string().nullable().default(null);

export const makeStateField = <T extends string>(values: [T, ...T[]]) =>
  z
    .union([z.enum(values), z.array(z.enum(values))])
    .transform((val) => (Array.isArray(val) ? val : [val]));

export const reactionsFilterField = makeStateField([
  ReactionsFilter.WithReactions,
  ReactionsFilter.WithoutReactions,
]);

export const commitCommentQuerySchema = z.object({
  username: usernameField,
  type: z.literal(ReactableType.CommitComment),
  cursor: cursorField,
});

export const issueCommentQuerySchema = z.object({
  username: usernameField,
  type: z.literal(ReactableType.IssueComment),
  cursor: cursorField,
});

export const issueQuerySchema = z.object({
  username: usernameField,
  type: z.literal(ReactableType.Issue),
  cursor: cursorField,
  state: makeStateField([IssueState.Open, IssueState.Closed]).optional(),
  reactions: reactionsFilterField.optional(),
});

export const pullRequestQuerySchema = z.object({
  username: usernameField,
  type: z.literal(ReactableType.PullRequest),
  cursor: cursorField,
  state: makeStateField([
    PullRequestState.Open,
    PullRequestState.Closed,
  ]).optional(),
  reactions: reactionsFilterField.optional(),
});

export const tableQuerySchema = z.discriminatedUnion(
  'type',
  [
    commitCommentQuerySchema,
    issueCommentQuerySchema,
    issueQuerySchema,
    pullRequestQuerySchema,
  ],
  {
    error: (issue) => {
      const input = issue.input as Record<string, unknown>;
      return input?.['type'] == null
        ? 'type is required'
        : `unsupported type: ${input['type']}`;
    },
  },
);
