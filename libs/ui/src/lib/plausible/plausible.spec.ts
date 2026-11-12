import { ApplicationInitStatus, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ENVIRONMENT, EnvironmentName } from '@org/environment';
import { init } from '@plausible-analytics/tracker';
import { providePlausible } from './plausible';

vi.mock('@plausible-analytics/tracker', () => ({ init: vi.fn() }));

async function start(name: EnvironmentName, platform: 'browser' | 'server') {
  TestBed.configureTestingModule({
    providers: [
      { provide: ENVIRONMENT, useValue: { name } },
      { provide: PLATFORM_ID, useValue: platform },
      providePlausible({ domain: 'example.com' }),
    ],
  });
  await TestBed.inject(ApplicationInitStatus).donePromise;
  // Let the dynamic import resolve.
  await new Promise((resolve) => setTimeout(resolve));
}

describe('providePlausible', () => {
  beforeEach(() => vi.mocked(init).mockClear());

  it('starts tracking in the browser in prod', async () => {
    await start('prod', 'browser');

    expect(init).toHaveBeenCalledWith({ domain: 'example.com' });
  });

  it.each(['dev', 'local'] as const)('does nothing in %s', async (name) => {
    await start(name, 'browser');

    expect(init).not.toHaveBeenCalled();
  });

  it('does nothing during SSR', async () => {
    await start('prod', 'server');

    expect(init).not.toHaveBeenCalled();
  });
});
