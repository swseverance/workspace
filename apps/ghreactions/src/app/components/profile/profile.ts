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
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
    const title = inject(Title);
    const meta = inject(Meta);
    const responseInit = inject(RESPONSE_INIT, { optional: true });

    effect(() => {
      title.setTitle(`${this.heading()} – GitHub Reactions`);
      meta.updateTag({
        name: 'description',
        content: `The GitHub ${this.current().label.toLowerCase()} by ${this.username()} with the most reactions.`,
      });

      // Only pages with rows belong in search results.
      const empty =
        this.notFound() || (this.profile.hasValue() && !this.rows().length);
      if (empty) {
        meta.updateTag({ name: 'robots', content: 'noindex' });
      } else {
        meta.removeTag('name="robots"');
      }

      // Server render only: a real 404 for users we don't track.
      if (responseInit && this.notFound()) responseInit.status = 404;
    });
  }
}
