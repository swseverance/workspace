import { Component, computed, input } from '@angular/core';
import { CodeBlock } from '../code-block/code-block';

export interface DescriptionSegment {
  kind: 'html' | 'code';
  html: string;
}

// marked renders a code block as <pre><code ...>...</code></pre>, and the
// markdown comes from this repo, so a pattern is enough to find them.
const PRE = /(<pre\b[\s\S]*?<\/pre>)/;

/** Splits description HTML into prose and <pre> blocks, in order. */
export function splitDescription(html: string): DescriptionSegment[] {
  return html
    .split(PRE)
    .map((part, i): DescriptionSegment => ({
      // split() puts the captured <pre> blocks at the odd indexes.
      kind: i % 2 === 1 ? 'code' : 'html',
      html: part,
    }))
    .filter((segment) => segment.html.trim() !== '');
}

@Component({
  selector: 'app-exercise-description',
  imports: [CodeBlock],
  // Angular sanitizes [innerHTML], stripping scripts and event handlers.
  // Code blocks get their own component so they can have a copy button,
  // which the sanitizer would strip from the HTML.
  template: `
    <div class="description">
      @for (segment of segments(); track $index) {
        @if (segment.kind === 'code') {
          <app-code-block [html]="segment.html" />
        } @else {
          <div class="prose" [innerHTML]="segment.html"></div>
        }
      }
    </div>
  `,
  styleUrl: './exercise-description.scss',
})
export class ExerciseDescription {
  /** HTML converted from the exercise's markdown on the server. */
  description = input.required<string>();

  protected readonly segments = computed(() =>
    splitDescription(this.description()),
  );
}
