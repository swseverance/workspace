import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthFacade } from '@org/auth';
import { Theme } from '@org/theme';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-root',
  imports: [
    AsyncPipe,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzTooltipModule,
    RouterLink,
    RouterOutlet,
  ],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthFacade);
  protected readonly theme = inject(Theme);
}
