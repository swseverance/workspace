import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

/** How long the button shows a check mark after copying. */
export const COPIED_MS = 2000;

/**
 * A <pre> block from an exercise description, with a button that copies its
 * text. The icon briefly turns into a check mark rather than showing a
 * message, which would replace any other (e.g. "Running Tests...").
 */
@Component({
  selector: 'app-code-block',
  imports: [NzButtonModule, NzIconModule, NzTooltipModule],
  template: `
    <button
      nz-button
      nzType="text"
      nzSize="small"
      type="button"
      class="copy"
      [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
      [nzTooltipTitle]="copied() ? 'Copied' : 'Copy code'"
      nz-tooltip
      (click)="copy()"
    >
      <nz-icon [nzType]="copied() ? 'check' : 'copy'" />
    </button>
    <div #content [innerHTML]="html()"></div>
  `,
  styleUrl: './code-block.scss',
})
export class CodeBlock {
  /** The block's HTML, a <pre> element as rendered from markdown. */
  html = input.required<string>();

  protected readonly copied = signal(false);

  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly clipboard = inject(Clipboard);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected copy(): void {
    // textContent, so entities like &lt; are copied as the characters shown.
    const text = this.content().nativeElement.textContent ?? '';

    if (!this.clipboard.copy(text)) {
      return;
    }

    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), COPIED_MS);
  }
}
