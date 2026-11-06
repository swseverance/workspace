import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AUTH } from '@org/firebase';
import { GoogleAuthProvider, signInWithRedirect, User } from 'firebase/auth';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Observable } from 'rxjs';
import { Page } from '../page/page';

@Component({
  selector: 'app-login',
  imports: [Page, NzButtonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private destroyRef = inject(DestroyRef);
  private auth = inject(AUTH);

  authenticated = signal<null | boolean>(null);

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

  login(): void {
    if (!this.auth) return;

    signInWithRedirect(this.auth, new GoogleAuthProvider());
  }
}
