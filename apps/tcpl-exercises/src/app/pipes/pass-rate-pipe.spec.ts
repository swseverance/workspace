import { TestBed } from '@angular/core/testing';
import { ExerciseStats } from '../../shared/models';
import { PassRatePipe } from './pass-rate-pipe';

function passRate(stats: ExerciseStats | null): string {
  return TestBed.runInInjectionContext(() => new PassRatePipe()).transform(
    stats,
  );
}

describe('PassRatePipe', () => {
  it('gives accepted as a percentage of submitted', () => {
    expect(passRate({ compiled: 100, passed: 62 })).toBe('62%');
  });

  it('rounds to a whole percentage', () => {
    expect(passRate({ compiled: 412, passed: 187 })).toBe('45%');
  });

  it('gives 100% when every submission passed', () => {
    expect(passRate({ compiled: 3, passed: 3 })).toBe('100%');
  });

  it('gives a dash before the first submission', () => {
    expect(passRate({ compiled: 0, passed: 0 })).toBe('–');
  });

  it("gives a dash when the counts couldn't be loaded", () => {
    expect(passRate(null)).toBe('–');
  });
});
