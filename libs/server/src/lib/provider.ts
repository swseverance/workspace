export type Provider<T> = {
  /** The provided value, created on first use if nothing was provided. */
  get(): T;
  /** Replaces the value, e.g. with a fake in a unit test. */
  provide(value: T): void;
  /** Forgets the value, so the next get() creates a fresh one. */
  reset(): void;
};

/**
 * A minimal stand-in for dependency injection on the server: holds one
 * shared instance, built lazily so importing a module never connects to
 * anything, and swappable so tests can provide a fake instead.
 */
export function createProvider<T>(create: () => T): Provider<T> {
  let value: T | undefined;

  return {
    get: () => (value ??= create()),
    provide: (next) => {
      value = next;
    },
    reset: () => {
      value = undefined;
    },
  };
}
