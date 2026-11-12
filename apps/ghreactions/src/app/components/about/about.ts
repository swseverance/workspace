import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { Data } from '../../services/data';

@Component({
  selector: 'app-about',
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    NzPageHeaderModule,
    NzTypographyModule,
    NzButtonModule,
    NzCardModule,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  analytics$ = inject(Data).analytics();

  constructor() {
    inject(SeoService).setPage(
      'Search Issues, PRs & Comments by User',
      'Search GitHub for reactions to issues, PRs, and comments. View activity across any public GitHub account.',
      '/',
    );
  }
}
