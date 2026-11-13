import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { REQUESTED_SNAPSHOT_DAYS } from '@org/ghreactions-github/models';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-about',
  imports: [
    RouterLink,
    NzPageHeaderModule,
    NzTypographyModule,
    NzButtonModule,
    NzInputModule,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private router = inject(Router);

  protected readonly snapshotDays = REQUESTED_SNAPSHOT_DAYS;
  protected readonly username = signal('');

  constructor() {
    inject(SeoService).setPage(
      'Search Issues, PRs & Comments by User',
      "See the most reacted GitHub issues, pull requests and comments of top developers, or search any public account's activity.",
      '/',
    );
  }

  /**
   * Goes to the user's snapshot page. `build` tells it the visitor asked for
   * this snapshot, so it builds one on arrival if there isn't one yet.
   */
  protected seeSnapshot(event: Event): void {
    event.preventDefault();
    // People paste "@name".
    const username = this.username().trim().replace(/^@/, '');
    if (!username) return;

    this.router.navigate(['/u', username.toLowerCase(), 'issues'], {
      state: { build: true },
    });
  }
}
