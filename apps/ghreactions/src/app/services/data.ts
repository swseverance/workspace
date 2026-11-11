import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  GHReactionsRow,
  IssueState,
  PullRequestState,
  ReactableType,
  ReactionsFilter,
  TablePage,
} from '@org/ghreactions-github/models';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { Adapter } from '../../models/adapter';
import { AnalyticsResponse } from '../../models/analytics';

const BLOCK_SIZE = 100;

// Error messages can echo request input (e.g. "unsupported type: <value>"
// from a shared link), and ag-grid renders overlay templates as HTML.
const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

@Injectable({
  providedIn: 'root',
})
export class Data {
  private http = inject(HttpClient);

  analytics() {
    return this.http.get<AnalyticsResponse>('/api/analytics');
  }

  create({
    username,
    type,
    state,
    reactions,
  }: {
    username: string;
    type: ReactableType;
    state: IssueState[] | PullRequestState[];
    reactions: ReactionsFilter[];
  }): IDatasource {
    const cursors = new Map<number, string>();

    return {
      getRows: (params: IGetRowsParams<GHReactionsRow, Adapter>) => {
        params.api.setGridOption('loading', true);

        const blockIndex = Math.floor(params.startRow / BLOCK_SIZE);
        const cursor = cursors.get(blockIndex);
        const httpParams = {
          username,
          type,
          ...(state.length ? { state } : null),
          ...(reactions.length ? { reactions } : null),
          ...(cursor ? { cursor } : null),
        };

        if (blockIndex === 0)
          params.api.setGridOption(
            'overlayNoRowsTemplate',
            '<span>No results</span>',
          );

        this.http
          .get<TablePage>('/api/table', { params: httpParams })
          .subscribe({
            next: ({ rows, nextCursor }) => {
              params.api.setGridOption('loading', false);

              if (nextCursor) cursors.set(blockIndex + 1, nextCursor);
              params.successCallback(
                rows,
                nextCursor ? undefined : params.startRow + rows.length,
              );
              if (rows.length === 0 && blockIndex === 0)
                params.api.showNoRowsOverlay();
              params.context.onServerSuccess();
            },
            error: (error: HttpErrorResponse) => {
              params.api.setGridOption('loading', false);
              params.api.setGridOption(
                'overlayNoRowsTemplate',
                `<span class="ghreactions-server-error">${escapeHtml(error.error?.message ?? 'Something went wrong')}</span>`,
              );
              params.successCallback([], 0);
              params.api.showNoRowsOverlay();
              params.context.onServerError(error);
            },
          });
      },
    };
  }
}
