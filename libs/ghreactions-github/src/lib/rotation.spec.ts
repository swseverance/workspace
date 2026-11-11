import { userForMinute } from './rotation';

const users = ['a', 'b', 'c'];
const minute = (n: number) => n * 60_000;

describe('userForMinute', () => {
  it('steps through the list one user per minute', () => {
    expect([0, 1, 2].map((n) => userForMinute(users, minute(n)))).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('wraps around after the last user', () => {
    expect(userForMinute(users, minute(3))).toBe('a');
  });

  it('picks the same user anywhere within a minute', () => {
    expect(userForMinute(users, minute(1) + 59_999)).toBe('b');
  });

  it('throws on an empty list', () => {
    expect(() => userForMinute([], 0)).toThrow();
  });
});
