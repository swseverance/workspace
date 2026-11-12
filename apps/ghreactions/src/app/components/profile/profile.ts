import { DatePipe } from '@angular/common';
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
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Data } from '../../services/data';
import { ReactionsTable } from '../reactions-table/reactions-table';
import { PROFILE_TABS } from './tabs';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, RouterLink, NzTabsModule, NzButtonModule, ReactionsTable],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private data = inject(Data);
  private params = toSignal(inject(ActivatedRoute).paramMap, {
    requireSync: true,
  });

  protected readonly tabs = PROFILE_TABS;
  private readonly requested = computed(() => this.params().get('username')!);
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
  private readonly notFound = computed(() => {
    const error = this.profile.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });
  protected readonly error = computed(() =>
    this.notFound()
      ? `We don't keep a profile for ${this.requested()}. Try searching instead.`
      : this.profile.error()
        ? 'Something went wrong loading this profile.'
        : null,
  );
  protected readonly heading = computed(
    () =>
      `${this.username()}'s most reacted ${this.current().label.toLowerCase()}`,
  );

  constructor() {
    const seo = inject(SeoService);
    const responseInit = inject(RESPONSE_INIT, { optional: true });

    effect(() => {
      if (this.notFound()) {
        seo.setUnindexedPage('Profile not found');
        // Server render only: a real 404 for users without a profile.
        if (responseInit) responseInit.status = 404;
        return;
      }

      // Nothing to describe until the profile loads.
      if (!this.profile.hasValue()) return;

      // Only tabs with rows belong in search results.
      if (!this.rows().length) {
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
}
