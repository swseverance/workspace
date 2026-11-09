import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

const SHOW_DELAY_MS = 150;
const MIN_VISIBLE_MS = 400;

@Component({
  selector: 'app-smart-loader',
  template: `
    <div class="smart-loader-skeleton" [class.visible]="showSkeleton()">
      <ng-content select="[loader-skeleton]" />
    </div>
    <div class="smart-loader-content" [class.hidden]="showSkeleton()">
      <ng-content />
    </div>
  `,
  styleUrl: './smart-loader.scss',
})
export class SmartLoader {
  loading = input<boolean>();

  protected readonly showSkeleton = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private shownAt = 0;
  private visible = false;

  constructor() {
    effect(() => {
      const isLoading = this.loading();

      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);

      if (isLoading) {
        this.showTimer = setTimeout(() => {
          this.shownAt = Date.now();
          this.visible = true;
          this.showSkeleton.set(true);
        }, SHOW_DELAY_MS);
      } else if (this.visible) {
        const remaining = Math.max(
          0,
          MIN_VISIBLE_MS - (Date.now() - this.shownAt),
        );

        this.hideTimer = setTimeout(() => {
          this.visible = false;
          this.showSkeleton.set(false);
        }, remaining);
      }
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);
    });
  }
}
