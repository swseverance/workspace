import { ReactableType } from '@org/ghreactions-github/models';
import { ProfileResponse } from '../../../models/profile';

// Separate from the component so the routes can check paths without loading it.
export const PROFILE_TABS = [
  {
    key: 'issues',
    label: 'Issues',
    path: 'issues',
    type: ReactableType.Issue,
  },
  {
    key: 'pullRequests',
    label: 'Pull Requests',
    path: 'pull-requests',
    type: ReactableType.PullRequest,
  },
  {
    key: 'issueComments',
    label: 'Recent Issue Comments',
    path: 'issue-comments',
    type: ReactableType.IssueComment,
  },
] as const satisfies readonly {
  key: keyof ProfileResponse;
  label: string;
  path: string;
  type: ReactableType;
}[];

export type ProfileTab = (typeof PROFILE_TABS)[number];
