import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';

/**
 * Shown for unknown URLs and for exercises that don't exist. The URL stays
 * as typed; during SSR the response is a 404 so crawlers drop the page.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, NzButtonModule],
  template: `
    <h1>Page not found</h1>
    <p>There's nothing at this address. It may have moved, or never existed.</p>
    <a nz-button nzType="primary" routerLink="/exercises"
      >Go to the exercises</a
    >
  `,
  styleUrl: './not-found.scss',
})
export class NotFound {
  constructor() {
    inject(SeoService).setUnindexedPage('Page not found');

    // Null in the browser.
    const responseInit = inject(RESPONSE_INIT, { optional: true });

    if (responseInit) {
      responseInit.status = 404;
    }
  }
}
