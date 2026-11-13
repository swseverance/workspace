import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  RESPONSE_INIT,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MIN_INDEXED_REACTIONS } from '@org/ghreactions-github/models';
import { SeoService } from '@org/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { Data } from '../../services/data';
import { ColumnCount } from '../reactions-table/column-count';

const TITLE = 'Most reacted GitHub users';

@Component({
  selector: 'app-users',
  imports: [
    DecimalPipe,
    RouterLink,
    NzAlertModule,
    NzEmptyModule,
    NzInputModule,
    NzTableModule,
    ColumnCount,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private data = inject(Data);
  private params = toSignal(inject(ActivatedRoute).paramMap, {
    requireSync: true,
  });

  /** 1-based; the routes only match positive integers. */
  protected readonly page = computed(() =>
    Number(this.params().get('page') ?? 1),
  );

  private readonly typed = new Subject<string>();
  /**
   * The start of a username to narrow the list to: what's in the filter box
   * once typing pauses, or '' for the whole ranking. Kept here rather than
   * in the URL, so typing doesn't navigate.
   */
  protected readonly filter = toSignal(
    this.typed.pipe(
      // People paste "@name".
      map((text) => text.trim().replace(/^@/, '')),
      debounceTime(500),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly result = rxResource({
    params: () => ({ page: this.page(), filter: this.filter() }),
    stream: ({ params }) => this.data.users(params.page, params.filter),
  });

  protected readonly users = computed(() =>
    this.result.hasValue() ? this.result.value().users : [],
  );
  /** Page links: 1 through the last page. */
  protected readonly pages = computed(() =>
    this.result.hasValue()
      ? Array.from({ length: this.result.value().pageCount }, (_, i) => i + 1)
      : [],
  );
  /** Rank of the first user on this page. Filtered results have no ranks. */
  protected readonly firstRank = computed(() => (this.page() - 1) * 100 + 1);

  protected onFilterInput(event: Event): void {
    this.typed.next((event.target as HTMLInputElement).value);
  }

  private readonly notFound = computed(() => {
    const error = this.result.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });
  protected readonly error = computed(() =>
    this.notFound()
      ? 'There is no such page.'
      : this.result.error()
        ? 'Something went wrong loading users.'
        : null,
  );

  protected readonly title = TITLE;
  protected readonly minReactions = MIN_INDEXED_REACTIONS;

  constructor() {
    const seo = inject(SeoService);
    const responseInit = inject(RESPONSE_INIT, { optional: true });

    effect(() => {
      if (this.notFound()) {
        seo.setUnindexedPage('Page not found');
        // Server render only: a real 404 past the last page.
        if (responseInit) responseInit.status = 404;
        return;
      }

      const page = this.page();
      seo.setPage(
        page === 1 ? TITLE : `${TITLE}, page ${page}`,
        'GitHub users ranked by the reactions on their top issues, pull requests and comments.',
        page === 1 ? '/users' : `/users/${page}`,
      );
    });
  }
}
