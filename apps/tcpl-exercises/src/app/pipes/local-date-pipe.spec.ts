import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocalDatePipe } from './local-date-pipe';

function createPipe(platform: 'browser' | 'server'): LocalDatePipe {
  TestBed.configureTestingModule({
    providers: [LocalDatePipe, { provide: PLATFORM_ID, useValue: platform }],
  });
  return TestBed.inject(LocalDatePipe);
}

describe('LocalDatePipe', () => {
  const iso = '2026-11-09T18:30:00.000Z';

  it('formats the date in the browser', () => {
    const pipe = createPipe('browser');

    expect(pipe.transform(iso, 'yyyy')).toBe('2026');
  });

  it('renders nothing on the server', () => {
    const pipe = createPipe('server');

    expect(pipe.transform(iso)).toBe('');
  });

  it('renders nothing for a missing date', () => {
    const pipe = createPipe('browser');

    expect(pipe.transform(null)).toBe('');
  });
});
