import { TestBed } from '@angular/core/testing';
import { ExerciseStats as Stats } from '../../../shared/models';
import { ExerciseStats } from './exercise-stats';

/** The text of each count, then of the label that says whose they are. */
function render(stats: Stats): string[] {
  const fixture = TestBed.createComponent(ExerciseStats);
  fixture.componentRef.setInput('stats', stats);
  fixture.detectChanges();

  const element: HTMLElement = fixture.nativeElement;

  return [...element.querySelectorAll('.stat, .scope')].map((item) =>
    item.textContent!.replace(/\s+/g, ' ').trim(),
  );
}

describe('ExerciseStats', () => {
  it('shows accepted, submitted and the percentage, for all users', () => {
    expect(render({ compiled: 100, passed: 62 })).toEqual([
      'Accepted: 62',
      'Submitted: 100',
      'Percentage: 62%',
      '*All users',
    ]);
  });

  it('rounds the percentage', () => {
    expect(render({ compiled: 412, passed: 187 })).toContain('Percentage: 45%');
  });

  it('groups thousands', () => {
    expect(render({ compiled: 12345, passed: 1234 })).toEqual([
      'Accepted: 1,234',
      'Submitted: 12,345',
      'Percentage: 10%',
      '*All users',
    ]);
  });

  it('shows a dash for the percentage before the first submission', () => {
    expect(render({ compiled: 0, passed: 0 })).toEqual([
      'Accepted: 0',
      'Submitted: 0',
      'Percentage: –',
      '*All users',
    ]);
  });
});
