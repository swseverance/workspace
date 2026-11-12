import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  IssueState,
  Profile,
  PullRequestState,
  ReactableType,
  ReactionsFilter,
  TablePage,
  UsersPage,
} from '@org/ghreactions-github/models';
import { AnalyticsResponse } from '../../models/analytics';

export type SearchParams = {
  username: string;
  type: ReactableType;
  state: IssueState[] | PullRequestState[];
  reactions: ReactionsFilter[];
};

@Injectable({
  providedIn: 'root',
})
export class Data {
  private http = inject(HttpClient);

  analytics() {
    return this.http.get<AnalyticsResponse>('/api/analytics');
  }

  /** A tracked user's precomputed profile; 404 for anyone else. */
  profile(username: string) {
    return this.http.get<Profile>(
      `/api/profile/${encodeURIComponent(username)}`,
    );
  }

  /** One page of users ranked by total reactions (1-based). */
  users(page: number) {
    return this.http.get<UsersPage>('/api/users', {
      params: page > 1 ? { page } : {},
    });
  }

  /** One page of search results; `cursor` comes from the previous page. */
  page({ username, type, state, reactions }: SearchParams, cursor?: string) {
    return this.http.get<TablePage>('/api/table', {
      params: {
        username,
        type,
        ...(state.length ? { state } : null),
        ...(reactions.length ? { reactions } : null),
        ...(cursor ? { cursor } : null),
      },
    });
  }
}
