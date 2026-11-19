/** Helpers for building test data in the exercises' `exercise.ts` files. */

/**
 * A seeded random number generator (mulberry32). Each call of the function
 * it returns gives the next 32-bit unsigned value.
 *
 * Use this rather than Math.random, so a test is the same input on every
 * build: results are saved against a test's id.
 */
export function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}

/** Joins values into text, one per line, each line ending in a newline. */
export function lines(values: readonly (string | number)[]): string {
  return values.map((value) => `${value}\n`).join('');
}
