import type { ThemeConfig, ThemeController, ThemeMode } from './theme';

/**
 * Applies the saved theme (or the OS preference) and puts a controller on
 * `window.theme`.
 *
 * It's inlined into the server-rendered page via `toString()`, so it runs
 * before first paint. That means it must be self-contained: no imports, no
 * references to anything outside its own body.
 */
export function initTheme(config: ThemeConfig): void {
  // Each theme stylesheet's `bundleName` in project.json.
  const stylesheets: Record<ThemeMode, string> = {
    light: 'light-theme',
    dark: 'dark-theme',
  };

  // Reading localStorage throws when the browser blocks site data.
  const storage = (): Storage | null => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  };

  const read = (): ThemeMode | null => {
    try {
      const value = storage()?.getItem(config.storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  };

  const write = (mode: ThemeMode): void => {
    try {
      storage()?.setItem(config.storageKey, mode);
    } catch {
      // Quota exceeded or writes blocked: the theme still applies for this
      // page, it just won't be remembered.
    }
  };

  const stylesheet = (mode: ThemeMode) =>
    document.querySelector<HTMLLinkElement>(
      `link[href^="${stylesheets[mode]}"]`,
    );

  const apply = (mode: ThemeMode): void => {
    const other: ThemeMode = mode === 'dark' ? 'light' : 'dark';

    const active = stylesheet(mode);
    const inactive = stylesheet(other);
    if (active) active.disabled = false;
    if (inactive) inactive.disabled = true;

    document.body.classList.add(config.classes[mode]);
    document.body.classList.remove(config.classes[other]);

    theme.mode = mode;
  };

  const theme: { mode: ThemeMode } & ThemeController = {
    mode: 'light',
    set(mode) {
      write(mode);
      apply(mode);
    },
    toggle() {
      theme.set(theme.mode === 'dark' ? 'light' : 'dark');
    },
  };

  const prefersDark = window.matchMedia?.(
    '(prefers-color-scheme: dark)',
  ).matches;

  apply(read() ?? (prefersDark ? 'dark' : 'light'));

  window.theme = theme;
}
