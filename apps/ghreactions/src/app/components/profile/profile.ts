import { Clipboard } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  RESPONSE_INIT,
  signal,
  untracked,
} from '@angular/core';
import {
  rxResource,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  MIN_INDEXED_REACTIONS,
  REQUESTED_SNAPSHOT_DAYS,
} from '@org/ghreactions-github/models';
import { SeoService } from '@org/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Data } from '../../services/data';
import { CardImage } from '../card-image/card-image';
import { ReactionsTable } from '../reactions-table/reactions-table';
import { PROFILE_TABS } from './tabs';

/** How long the copy button shows a check mark after copying. */
const COPIED_MS = 2000;

/**
 * A user's snapshot: their most reacted items, one tab per type.
 *
 * When there's no snapshot yet, the page offers to build one. Building is
 * always something the visitor asked for (the button here, or the form or
 * link that brought them), never a side effect of opening the page.
 */
@Component({
  selector: 'app-profile',
  imports: [
    CardImage,
    DatePipe,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzCollapseModule,
    NzIconModule,
    NzSpinModule,
    NzTabsModule,
    NzTooltipModule,
    ReactionsTable,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private data = inject(Data);
  private destroyRef = inject(DestroyRef);
  private seo = inject(SeoService);
  private clipboard = inject(Clipboard);
  private params = toSignal(inject(ActivatedRoute).paramMap, {
    requireSync: true,
  });

  protected readonly tabs = PROFILE_TABS;
  protected readonly snapshotDays = REQUESTED_SNAPSHOT_DAYS;
  protected readonly requested = computed(() => this.params().get('username')!);
  // The routes only match known tab paths.
  protected readonly current = computed(() =>
    PROFILE_TABS.find((t) => t.path === this.params().get('tab'))!,
  );

  // Keyed on the username only, so switching tabs doesn't refetch.
  protected readonly profile = rxResource({
    params: () => this.requested(),
    stream: ({ params }) => this.data.profile(params),
  });

  protected readonly username = computed(() =>
    this.profile.hasValue() ? this.profile.value().username : this.requested(),
  );
  protected readonly rows = computed(() =>
    this.profile.hasValue() ? this.profile.value()[this.current().key] : [],
  );
  /** There's no snapshot for this user (yet). */
  protected readonly missing = computed(() => {
    const error = this.profile.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });
  protected readonly error = computed(() =>
    this.profile.error() && !this.missing()
      ? 'Something went wrong loading this snapshot.'
      : null,
  );
  protected readonly heading = computed(
    () =>
      `${this.username()}'s most reacted ${this.current().label.toLowerCase()}`,
  );

  // The card for the user's GitHub profile README, and the Markdown for it.
  protected readonly cardOpen = signal(true);
  protected readonly copied = signal(false);
  private copiedTimer?: ReturnType<typeof setTimeout>;
  /**
   * HTML rather than Markdown: a <picture> is what GitHub supports for
   * showing a different image in dark mode. Its older way, image URLs ending
   * in #gh-dark-mode-only, does nothing for images from other sites, so both
   * cards showed.
   */
  protected readonly cardMarkdown = computed(() => {
    // Not the browser's origin: the panel is in the server's render too.
    const origin = this.seo.siteUrl;
    const name = this.username().toLowerCase();
    const card = `${origin}/card/${name}.svg`;

    return [
      `<a href="${origin}/u/${name}/issues">`,
      `  <picture>`,
      `    <source media="(prefers-color-scheme: dark)" srcset="${card}?theme=dark">`,
      `    <img alt="${this.username()}'s positive reactions on GitHub" src="${card}?theme=light">`,
      `  </picture>`,
      `</a>`,
    ].join('\n');
  });

  protected readonly building = signal(false);
  protected readonly buildError = signal<string | null>(null);

  /**
   * The username the visitor asked for a snapshot of on the way here (the
   * home page's form passes `build` in the navigation's state), so it's built
   * on arrival without a second click. Not part of the URL: a reload, a
   * shared link or a crawler never carries it.
   */
  private buildOnArrival =
    inject(Router).currentNavigation()?.extras.state?.['build'] === true
      ? this.requested()
      : null;

  constructor() {
    const seo = this.seo;

    this.destroyRef.onDestroy(() => clearTimeout(this.copiedTimer));
    const responseInit = inject(RESPONSE_INIT, { optional: true });

    // Another user's card hasn't been copied yet.
    effect(() => {
      this.requested();
      this.copied.set(false);
    });

    effect(() => {
      if (this.missing() && this.buildOnArrival === this.requested()) {
        this.buildOnArrival = null;
        untracked(() => this.build());
      }
    });

    effect(() => {
      if (this.missing()) {
        seo.setUnindexedPage('No snapshot yet');
        // Server render only: a real 404 for users without a snapshot. Not
        // one the CDN may keep, as this route's other responses are: the
        // snapshot could be built a moment from now.
        if (responseInit) {
          const headers = new Headers(responseInit.headers);
          headers.set('Cache-Control', 'no-store');
          responseInit.status = 404;
          responseInit.headers = headers;
        }
        return;
      }

      // Nothing to describe until the profile loads.
      if (!this.profile.hasValue()) return;

      // Only tabs with rows, of ranked users with enough reactions, belong
      // in search results. A snapshot someone asked for expires.
      if (
        !this.rows().length ||
        !this.profile.value().ranked ||
        this.profile.value().totalReactions < MIN_INDEXED_REACTIONS
      ) {
        seo.setUnindexedPage(this.heading());
        return;
      }

      const label = this.current().label.toLowerCase();
      seo.setPage(
        this.heading(),
        `The GitHub ${label} by ${this.username()} with the most reactions.`,
        `/u/${this.username().toLowerCase()}/${this.current().path}`,
      );
    });
  }

  protected copy(): void {
    if (!this.clipboard.copy(this.cardMarkdown())) return;

    this.copied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(false), COPIED_MS);
  }

  protected build(): void {
    if (this.building()) return;

    const username = this.requested();
    this.building.set(true);
    this.buildError.set(null);

    this.data
      .buildProfile(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.building.set(false);
          // The page has moved on to another user since.
          if (username === this.requested()) this.profile.set(profile);
        },
        error: (error: unknown) => {
          this.building.set(false);
          this.buildError.set(buildErrorMessage(error, username));
        },
      });
  }
}

function buildErrorMessage(error: unknown, username: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 404 || error.status === 400) {
      return `GitHub has no user named ${username}.`;
    }
    // Rate limits explain themselves.
    const message = error.error?.message;
    if (error.status === 429 && typeof message === 'string') return message;
  }
  return 'Something went wrong building this snapshot. Please try again.';
}
