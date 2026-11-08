import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Theme, ThemeController, ThemeMode } from './theme';

/** Stands in for the controller index.js puts on `window.theme`. */
function fakeController(initial: ThemeMode): ThemeController {
  const controller = {
    mode: initial,
    set: vi.fn((mode: ThemeMode) => (controller.mode = mode)),
    toggle: vi.fn(
      () => (controller.mode = controller.mode === 'dark' ? 'light' : 'dark'),
    ),
  };
  return controller;
}

describe('Theme', () => {
  function setup(platform: 'browser' | 'server' = 'browser') {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(Theme);
  }

  afterEach(() => {
    delete window.theme;
  });

  it('starts with the mode index.js applied', async () => {
    window.theme = fakeController('dark');

    expect(await firstValueFrom(setup().mode$)).toBe('dark');
  });

  it('toggles through the controller and emits the new mode', async () => {
    window.theme = fakeController('light');
    const theme = setup();

    theme.toggle();

    expect(window.theme.toggle).toHaveBeenCalled();
    expect(await firstValueFrom(theme.mode$)).toBe('dark');
  });

  it('sets through the controller and emits the new mode', async () => {
    window.theme = fakeController('light');
    const theme = setup();

    theme.set('dark');

    expect(window.theme.set).toHaveBeenCalledWith('dark');
    expect(await firstValueFrom(theme.mode$)).toBe('dark');
  });

  it('defaults to light and does nothing when index.js did not run', async () => {
    const theme = setup();

    theme.toggle();

    expect(await firstValueFrom(theme.mode$)).toBe('light');
  });

  it('ignores the controller on the server', async () => {
    window.theme = fakeController('dark');
    const theme = setup('server');

    theme.toggle();

    expect(window.theme.toggle).not.toHaveBeenCalled();
    expect(await firstValueFrom(theme.mode$)).toBe('light');
  });
});
