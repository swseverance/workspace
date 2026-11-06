import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { AUTH } from '@org/firebase';
import { signOut, User } from 'firebase/auth';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzLayoutModule, NzButtonModule, NzSpinModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private destroyRef = inject(DestroyRef);
  private auth = inject(AUTH);
  private router = inject(Router);
  private message = inject(NzMessageService);

  authenticated = signal<null | boolean>(null);
  displayLoader = signal(true);
  logoutPending = false;

  async logout() {
    if (this.logoutPending || !this.auth) return;

    this.logoutPending = true;

    try {
      await signOut(this.auth);

      this.router.navigateByUrl('login');

      this.message.success('Logged out');
    } catch (error) {
      console.error('signOut()', error);

      this.message.error('Failed to log out');
    } finally {
      this.logoutPending = false;
    }
  }

  ngOnInit(): void {
    const auth = this.auth;

    if (!auth) {
      this.authenticated.set(false);
      return;
    }

    new Observable<User | null>((observer) =>
      auth.onAuthStateChanged((user) => observer.next(user)),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.authenticated.set(Boolean(user)));
  }
}
