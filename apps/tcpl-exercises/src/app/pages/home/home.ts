import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@org/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NzButtonModule, NzTypographyModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor() {
    inject(SeoService).setPage(
      'The C Programming Language exercises',
      'Work through the exercises from Kernighan and Ritchie’s The C Programming Language (K&R) in your browser. Write C, run it against tests, and compare with a reference solution.',
      '/',
    );
  }
}
