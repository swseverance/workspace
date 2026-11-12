import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, input, model } from '@angular/core';
import { GHReactionsRow } from '@org/ghreactions-github/models';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ColumnCount } from './column-count';
import { REACTIONS } from './reactions';

/**
 * Reactions results: a table, which CSS restacks into cards below 600px
 * (one markup for every device, so the server's HTML is always right).
 *
 * Pagination is client-side by default (pass every row). Pass `total` to page
 * on the server instead: `rows` is then just the current page, and the parent
 * fetches a new one on `pageIndexChange`.
 */
@Component({
  selector: 'app-reactions-table',
  imports: [ColumnCount, DatePipe, NzAlertModule, NzEmptyModule, NzTableModule],
  templateUrl: './reactions-table.html',
  styleUrl: './reactions-table.scss',
})
export class ReactionsTable {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  rows = input.required<GHReactionsRow[]>();
  /** Total row count for server-side paging; null pages on the client. */
  total = input<number | null>(null);
  pageSize = input(100);
  pageIndex = model(1);
  loading = input(false);
  /** Shown in place of rows when set. */
  error = input<string | null>(null);
  /** Shown when there are no rows and nothing is loading. */
  emptyText = input('No results');

  protected readonly reactions = REACTIONS;
  /** Repository, Content, Type, State, Updated, one per reaction, Total. */
  protected readonly columnCount = 5 + REACTIONS.length + 1;

  protected onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
    this.host.nativeElement.scrollIntoView?.({ block: 'start' });
  }
}
