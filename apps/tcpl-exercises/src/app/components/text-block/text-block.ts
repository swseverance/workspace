import { Component, computed, input } from '@angular/core';
import { VisibleText } from '../visible-text/visible-text';

/** Line-numbered text, shown exactly as given (nothing trimmed). */
@Component({
  selector: 'app-text-block',
  imports: [VisibleText],
  template: `
    @if (lines().length === 0) {
      <div class="empty">{{ emptyText() }}</div>
    } @else {
      <div class="lines" [class.error]="tone() === 'error'">
        @for (line of lines(); track $index) {
          <span class="number">{{ $index + 1 }}</span>
          <app-visible-text [text]="line.text" [newline]="line.newline" />
        }
      </div>
    }
  `,
  styleUrl: './text-block.scss',
})
export class TextBlock {
  text = input.required<string>();

  emptyText = input('(empty)');

  tone = input<'default' | 'error'>('default');

  protected readonly lines = computed(() => {
    const text = this.text();

    if (text === '') {
      return [];
    }

    const lines = text.split('\n');
    const endsWithNewline = lines.at(-1) === '';

    if (endsWithNewline) {
      lines.pop();
    }

    return lines.map((line, i) => ({
      text: line,
      newline: i < lines.length - 1 || endsWithNewline,
    }));
  });
}
