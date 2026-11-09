import { Component, computed, input } from '@angular/core';
import { Span, toGlyphs } from '../../../shared/output-diff';

/**
 * Inline text with whitespace and control characters drawn, so a stray
 * space or tab is as visible as any other character.
 */
@Component({
  selector: 'app-visible-text',
  // Each interpolation sits alone inside its element: under pre-wrap, any
  // whitespace around it would show up as a space in the output.
  template: `
    @for (span of runs(); track $index) {
      <span [class.changed]="span.changed">
        @for (glyph of span.glyphs; track $index) {
          <span [class]="glyph.kind">{{ glyph.text }}</span>
        }
      </span>
    }
    @if (newline()) {
      <span class="newline" aria-label="newline">↵</span>
    }
  `,
  styles: `
    :host {
      white-space: pre-wrap;
      word-break: break-all;
    }

    .space,
    .tab,
    .newline {
      color: var(--tc-glyph);
    }

    .tab {
      display: inline-block;
      min-width: 2ch;
    }

    .newline {
      padding-left: 2px;
      user-select: none;
    }

    .control {
      padding: 0 2px;
      border-radius: 3px;
      color: var(--tc-control);
      background: var(--tc-control-bg);
    }

    /* The parent sets --changed-bg for its side of a diff. */
    .changed {
      border-radius: 2px;
      background: var(--changed-bg);
      box-shadow: 0 0 0 1px var(--changed-bg);

      .space,
      .tab {
        color: inherit;
        opacity: 0.6;
      }
    }
  `,
})
export class VisibleText {
  /** Either plain text or pre-split spans with changed parts marked. */
  text = input<string | Span[]>('');

  /** Draws a trailing newline marker. */
  newline = input(false);

  protected readonly runs = computed(() => {
    const text = this.text();
    const spans = typeof text === 'string' ? [{ text, changed: false }] : text;

    return spans.map((span) => ({
      changed: span.changed,
      glyphs: toGlyphs(span.text),
    }));
  });
}
