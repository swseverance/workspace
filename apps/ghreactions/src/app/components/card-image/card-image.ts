import { Component, computed, input } from '@angular/core';

/**
 * A user's README card, in this site's theme.
 *
 * On its own the card follows the viewer's system setting, which this site's
 * theme switch can differ from. So both fixed versions are here and the
 * stylesheet shows the one matching the theme class on <body>: right from the
 * first paint, with no src to change after hydration. Lazy loading keeps the
 * hidden one from being fetched.
 */
@Component({
  selector: 'app-card-image',
  template: `
    @for (theme of themes; track theme) {
      <img
        [class]="theme"
        [src]="path() + '?theme=' + theme"
        [alt]="username() + '\\'s positive reactions card'"
        width="460"
        height="176"
        loading="lazy"
      />
    }
  `,
  styleUrl: './card-image.scss',
})
export class CardImage {
  readonly username = input.required<string>();

  protected readonly themes = ['light', 'dark'] as const;
  protected readonly path = computed(
    () => `/card/${this.username().toLowerCase()}.svg`,
  );
}
