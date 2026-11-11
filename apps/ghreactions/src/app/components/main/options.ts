import {
  IssueState,
  PullRequestState,
  ReactableType,
  ReactionsFilter,
} from '@org/ghreactions-github/models';

type Option<T> = { label: string; value: T };

export const TYPE_OPTIONS: Option<ReactableType>[] = [
  { label: 'Commit Comment', value: ReactableType.CommitComment },
  { label: 'Issue', value: ReactableType.Issue },
  { label: 'Issue Comment', value: ReactableType.IssueComment },
  { label: 'Pull Request', value: ReactableType.PullRequest },
];

const ISSUE_STATE_OPTIONS: Option<IssueState>[] = [
  {
    label: 'Open',
    value: IssueState.Open,
  },
  {
    label: 'Closed',
    value: IssueState.Closed,
  },
];

const PULL_REQUEST_STATE_OPTIONS: Option<PullRequestState>[] = [
  {
    label: 'Open',
    value: PullRequestState.Open,
  },
  {
    label: 'Closed',
    value: PullRequestState.Closed,
  },
];

const REACTIONS_OPTIONS: Option<ReactionsFilter>[] = [
  {
    label: 'With',
    value: ReactionsFilter.WithReactions,
  },
  {
    label: 'Without',
    value: ReactionsFilter.WithoutReactions,
  },
];

export const TYPE_CONFIG = {
  [ReactableType.CommitComment]: {
    stateOptions: [],
    state: [],
    stateEnabled: false,

    reactionsOptions: [],
    reactions: [],
    reactionsEnabled: false,
  },
  [ReactableType.Issue]: {
    stateOptions: ISSUE_STATE_OPTIONS,
    state: [IssueState.Open, IssueState.Closed],
    stateEnabled: true,

    reactionsOptions: REACTIONS_OPTIONS,
    reactions: [ReactionsFilter.WithReactions],
    reactionsEnabled: true,
  },
  [ReactableType.IssueComment]: {
    stateOptions: [],
    state: [],
    stateEnabled: false,

    reactionsOptions: [],
    reactions: [],
    reactionsEnabled: false,
  },
  [ReactableType.PullRequest]: {
    stateOptions: PULL_REQUEST_STATE_OPTIONS,
    state: [PullRequestState.Open, PullRequestState.Closed],
    stateEnabled: true,

    reactionsOptions: REACTIONS_OPTIONS,
    reactions: [ReactionsFilter.WithReactions],
    reactionsEnabled: true,
  },
};
