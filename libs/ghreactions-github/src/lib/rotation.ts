const MINUTE_MS = 60_000;

/**
 * Picks the user to refresh for the minute containing `time`. Each user comes
 * up once every `users.length` minutes, with no state stored between runs.
 */
export function userForMinute(
  users: readonly string[],
  time: number = Date.now(),
): string {
  if (users.length === 0) throw new Error('No users to rotate through');
  const minute = Math.floor(time / MINUTE_MS);
  return users[minute % users.length];
}
