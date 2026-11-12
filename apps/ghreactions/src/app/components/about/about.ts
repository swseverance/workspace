import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-about',
  imports: [RouterLink, NzPageHeaderModule, NzTypographyModule, NzButtonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  constructor() {
    inject(SeoService).setPage(
      'Search Issues, PRs & Comments by User',
      "See the most reacted GitHub issues, pull requests and comments of top developers, or search any public account's activity.",
      '/',
    );
  }
}
