import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '@org/auth';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Page } from '../page/page';

@Component({
  selector: 'app-login',
  imports: [Page, NzButtonModule, NzSpinModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthFacade);
  status = toSignal(this.auth.status$, { initialValue: 'unknown' as const });

  login(): void {
    this.auth.signIn();
  }
}
