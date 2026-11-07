import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { Data } from '../../services/data';
import { ThemeService } from '../../tokens';

@Component({
  selector: 'app-about',
  imports: [
    AsyncPipe,
    RouterLink,
    NzPageHeaderModule,
    NzTypographyModule,
    NzButtonModule,
    NzCardModule,
    NzStatisticModule,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected themeService = inject(ThemeService);

  analytics$ = inject(Data).analytics();

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Search GitHub for reactions to issues, PRs, and commits. View activity across any public GitHub account.',
    });
  }
}
