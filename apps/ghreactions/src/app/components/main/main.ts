import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  GHReactionsRow,
  IssueState,
  PullRequestState,
  ReactableType,
  ReactionsFilter,
} from '@org/ghreactions-github/models';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subscription } from 'rxjs';
import { Data, SearchParams } from '../../services/data';
import { ReactionsTable } from '../reactions-table/reactions-table';
import { TYPE_CONFIG, TYPE_OPTIONS } from './options';

// Rows per page from /api/table; the server fills every page but the last.
const PAGE_SIZE = 100;

@Component({
  selector: 'app-main',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCollapseModule,
    NzGridModule,
    NzIconModule,
    ReactionsTable,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private seo = inject(SeoService);
  private dataService = inject(Data);

  protected rows = signal<GHReactionsRow[]>([]);
  protected total = signal(0);
  protected pageIndex = signal(1);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected searched = signal(false);

  private search: SearchParams | null = null;
  /** Cursor for each page after the first, learned from the page before. */
  private cursors = new Map<number, string>();
  /** Set once the last page has been seen. */
  private knownTotal: number | null = null;
  private request?: Subscription;

  ReactableType = ReactableType;

  typeOptions = TYPE_OPTIONS;

  typeConfig = TYPE_CONFIG;

  defaultModel = {
    username: '',
    type: ReactableType.Issue,
    state: TYPE_CONFIG[ReactableType.Issue].state,
    reactions: TYPE_CONFIG[ReactableType.Issue].reactions,
  };

  form = new FormGroup({
    username: new FormControl<string>(this.defaultModel.username, {
      nonNullable: true,
      validators: Validators.required,
    }),
    type: new FormControl<ReactableType>(this.defaultModel.type, {
      nonNullable: true,
    }),
    state: new FormControl<IssueState[] | PullRequestState[]>(
      this.defaultModel.state,
      {
        nonNullable: true,
      },
    ),
    reactions: new FormControl<ReactionsFilter[]>(this.defaultModel.reactions, {
      nonNullable: true,
    }),
  });

  constructor() {
    // Browser only: a shared /search link shouldn't make SSR call GitHub.
    afterNextRender(() => {
      if (this.form.valid) this.startSearch();
    });
  }

  onSearch(): void {
    const queryParams: Params = {};

    for (const [key, value] of Object.entries(this.form.getRawValue())) {
      if (value) queryParams[key] = value;
    }

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'replace',
    });

    this.startSearch();
  }

  private startSearch(): void {
    this.search = this.form.getRawValue();
    this.searched.set(true);
    this.cursors.clear();
    this.knownTotal = null;
    this.total.set(0);
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (!this.search) return;

    this.pageIndex.set(page);
    this.loading.set(true);
    this.error.set(null);
    this.request?.unsubscribe();
    this.request = this.dataService
      .page(this.search, this.cursors.get(page))
      .subscribe({
        next: ({ rows, nextCursor }) => {
          if (nextCursor) this.cursors.set(page + 1, nextCursor);
          else this.knownTotal = (page - 1) * PAGE_SIZE + rows.length;

          // Page numbers reach one past the furthest page seen, until the end.
          this.total.set(
            this.knownTotal ?? Math.max(this.total(), (page + 1) * PAGE_SIZE),
          );
          this.rows.set(rows);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => this.onServerError(error),
      });
  }

  onServerError(error: HttpErrorResponse): void {
    this.loading.set(false);
    this.rows.set([]);
    this.error.set(error.error?.message ?? 'Something went wrong');
    if (error.status === 400) {
      const { username, type, state, reactions } = this.defaultModel;
      this.form.get('username')!.setValue(username);
      this.form.get('type')!.setValue(type);
      this.form.get('state')!.setValue(state);
      this.form.get('reactions')!.setValue(reactions);
    }
  }

  ngOnInit(): void {
    // Canonical without the query, so every search's URL counts as this page.
    this.seo.setPage(
      'Search',
      'Search GitHub for reactions to issues, pull requests, and comments. Filter by state, type, and reactions.',
      '/search',
    );

    this.form
      .get('type')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        const {
          state: defaultState,
          stateEnabled,
          reactions: defaultReactions,
          reactionsEnabled,
        } = TYPE_CONFIG[type];

        const state = this.form.get('state')!;
        state.setValue(defaultState);
        stateEnabled ? state.enable() : state.disable();

        const reactions = this.form.get('reactions')!;
        reactions.setValue(defaultReactions);
        reactionsEnabled ? reactions.enable() : reactions.disable();
      });

    const {
      username,
      type,
      state: rawState,
      reactions: rawReactions,
    } = this.route.snapshot.queryParams;

    if (username && typeof username === 'string') {
      this.form.patchValue({ username: username as string });
    }

    // Ignore an unknown type (e.g. a hand-edited link): the template looks up
    // its options in TYPE_CONFIG and would throw.
    if (typeof type === 'string' && Object.hasOwn(TYPE_CONFIG, type)) {
      this.form.patchValue({ type: type as ReactableType });

      const state = rawState ?? [];

      this.form.patchValue({
        state: Array.isArray(state) ? state : [state],
      });

      const reactions = rawReactions ?? [];

      this.form.patchValue({
        reactions: Array.isArray(reactions) ? reactions : [reactions],
      });
    }

    // A search from the URL starts after hydration (see the constructor). Show
    // the spinner from the first render, the server's included, instead of
    // "No results" until then.
    if (this.form.valid) this.loading.set(true);
  }
}
