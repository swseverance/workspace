import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { AuthActions, AuthFacade } from '@org/auth';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzLayoutModule, NzButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private auth = inject(AuthFacade);
  private router = inject(Router);

  authenticated = toSignal(this.auth.user$.pipe(map(Boolean)), {
    initialValue: false,
  });

  constructor() {
    inject(Actions)
      .pipe(ofType(AuthActions.signOutSucceeded), takeUntilDestroyed())
      .subscribe(() => this.router.navigateByUrl('/login'));
  }

  logout(): void {
    this.auth.signOut();
  }
}
