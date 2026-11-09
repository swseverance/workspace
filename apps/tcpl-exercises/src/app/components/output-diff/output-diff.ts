import { Component, computed, input, signal } from '@angular/core';
import { DiffRow, foldRows } from '../../../shared/output-diff';
import { VisibleText } from '../visible-text/visible-text';

/**
 * Expected and actual output side by side, aligned line by line, with the
 * characters that differ highlighted and long matching stretches folded.
 */
@Component({
  selector: 'app-output-diff',
  imports: [VisibleText],
  template: `
    <div class="grid" role="table" aria-label="Expected and actual output">
      <div class="heading expected" role="columnheader">Expected</div>
      <div class="heading actual" role="columnheader">Your output</div>

      @for (block of blocks(); track $index; let b = $index) {
        @if (block.kind === 'fold' && !expanded().has(b)) {
          <button type="button" class="fold" (click)="expand(b)">
            ⋯ Show {{ block.rows.length }} matching lines
          </button>
        } @else {
          @for (row of block.rows; track $index) {
            @let expected = row.kind === 'extra' ? null : row.expected;
            @let actual = row.kind === 'missing' ? null : row.actual;

            <div class="row {{ row.kind }}" role="row">
              @if (expected) {
                <span class="number expected">{{ expected.number }}</span>
                <app-visible-text
                  class="line expected"
                  role="cell"
                  [text]="expected.spans"
                  [newline]="expected.newline"
                />
              } @else {
                <span class="number blank"></span>
                <span class="line blank" role="cell"></span>
              }

              @if (actual) {
                <span class="number actual">{{ actual.number }}</span>
                <app-visible-text
                  class="line actual"
                  role="cell"
                  [text]="actual.spans"
                  [newline]="actual.newline"
                />
              } @else {
                <span class="number blank"></span>
                <span class="line blank" role="cell"></span>
              }
            </div>
          }
        }
      }
    </div>
  `,
  styleUrl: './output-diff.scss',
})
export class OutputDiff {
  rows = input.required<DiffRow[]>();

  protected readonly blocks = computed(() => foldRows(this.rows()));

  protected readonly expanded = signal(new Set<number>());

  protected expand(block: number): void {
    this.expanded.update((set) => new Set(set).add(block));
  }
}
