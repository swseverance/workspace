import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { AuthFacade } from '../store/auth.facade';

export type SignInDialogData = {
  /**
   * signIn: Google, or have a sign-in link emailed.
   * confirmEmail: back from an emailed link on a device that didn't ask for
   * it, so it doesn't know the address the link was sent to.
   */
  mode: 'signIn' | 'confirmEmail';
};

/** What the dialog closes with; undefined when dismissed. */
export type SignInDialogResult =
  { provider: 'google' } | { email: string } | undefined;

/** The sign-in modal's content. */
@Component({
  selector: 'lib-sign-in-dialog',
  imports: [NzButtonModule, NzDividerModule, NzInputModule],
  template: `
    @if (mode === 'confirmEmail') {
      <p>Enter the email address the sign-in link was sent to.</p>
      <form class="email-form" (submit)="confirmEmail($event)">
        <input
          nz-input
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          aria-label="Email address"
          [value]="email()"
          (input)="email.set($any($event.target).value)"
        />
        <button nz-button nzType="primary" type="submit">Sign in</button>
      </form>
    } @else if (sentTo(); as address) {
      <p>
        Check your inbox: we sent a sign-in link to
        <strong>{{ address }}</strong
        >. Open it on this device to sign in.
      </p>
      <button nz-button nzType="link" type="button" (click)="sentTo.set(null)">
        Use a different email
      </button>
    } @else {
      <button
        nz-button
        nzBlock
        nzType="primary"
        type="button"
        (click)="close({ provider: 'google' })"
      >
        Sign in with Google
      </button>

      <nz-divider nzText="or" />

      <form class="email-form" (submit)="sendLink($event)">
        <input
          nz-input
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          aria-label="Email address"
          [value]="email()"
          (input)="email.set($any($event.target).value)"
        />
        <button nz-button type="submit" [nzLoading]="sending()">
          Email me a link
        </button>
      </form>
    }
  `,
  styles: `
    .email-form {
      display: flex;
      gap: 8px;
    }
  `,
})
export class SignInDialog {
  private readonly modalRef = inject<NzModalRef<SignInDialog>>(NzModalRef);
  private readonly auth = inject(AuthFacade);

  protected readonly mode = inject<SignInDialogData>(NZ_MODAL_DATA).mode;
  protected readonly email = signal('');
  protected readonly sending = signal(false);
  /** The address the link went to, once sent. */
  protected readonly sentTo = signal<string | null>(null);

  constructor() {
    this.auth.signInLinkResult$
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((email) => {
        this.sending.set(false);
        this.sentTo.set(email);
      });
  }

  protected close(result: SignInDialogResult): void {
    this.modalRef.close(result);
  }

  protected sendLink(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (!email || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.auth.sendSignInLink(email);
  }

  protected confirmEmail(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (email) {
      this.close({ email });
    }
  }
}
