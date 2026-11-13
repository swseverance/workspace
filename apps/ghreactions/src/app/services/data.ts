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

  /** A user's stored snapshot; 404 if there isn't one. Never builds one. */
  profile(username: string) {
    return this.http.get<Profile>(
      `/api/profile/${encodeURIComponent(username)}`,
    );
  }

  /**
   * A user's snapshot, built from GitHub now if there isn't one (which takes
   * a few seconds). 404 if GitHub has no such user; 429 when no more can be
   * built for now.
   */
  buildProfile(username: string) {
    return this.http.post<Profile>(
      `/api/profile/${encodeURIComponent(username)}`,
      null,
    );
  }

  /**
   * One page of users ranked by total reactions (1-based). With `filter`,
   * the ranked users whose username starts with it instead, as one page.
   */
  users(page: number, filter = '') {
    return this.http.get<UsersPage>('/api/users', {
      params: filter ? { q: filter } : page > 1 ? { page } : {},
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
