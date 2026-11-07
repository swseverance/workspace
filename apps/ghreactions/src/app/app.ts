import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FIREBASE_APP_CHECK } from '@org/firebase';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { ThemeService } from './tokens';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  themeService = inject(ThemeService);

  constructor() {
    // Activates App Check once near the root, rather than relying on it
    // being pulled in incidentally by whatever component happens to be
    // first to touch HttpClient.
    inject(FIREBASE_APP_CHECK);
  }
}
