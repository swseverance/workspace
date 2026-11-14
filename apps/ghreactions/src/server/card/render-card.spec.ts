import { describe, expect, it } from 'vitest';
import { compactCount, renderCard, renderMissingCard } from './render-card';

const counts = {
  THUMBS_UP: 8421,
  HEART: 2310,
  HOORAY: 1204,
  ROCKET: 947,
  LAUGH: 312,
};

describe('compactCount', () => {
  it('leaves counts under a thousand alone', () => {
    expect(compactCount(0)).toBe('0');
    expect(compactCount(999)).toBe('999');
  });

  it('shortens thousands and millions, rounding down', () => {
    expect(compactCount(1000)).toBe('1k');
    expect(compactCount(1250)).toBe('1.2k');
    expect(compactCount(9999)).toBe('9.9k');
    expect(compactCount(12_345)).toBe('12k');
    expect(compactCount(999_999)).toBe('999k');
    expect(compactCount(1_234_567)).toBe('1.2m');
  });
});

describe('renderCard', () => {
  const svg = renderCard({ username: 'octocat', counts });

  it('shows the username, the total and each count', () => {
    expect(svg).toContain('@octocat');
    expect(svg).toContain('>13,194<');
    for (const count of ['8.4k', '2.3k', '1.2k', '947', '312']) {
      expect(svg).toContain(`${count}</tspan>`);
    }
  });

  it('holds nothing GitHub would strip or block', () => {
    expect(svg).not.toMatch(/<script|<a |href=|<image|url\(/);
  });

  it('escapes the username', () => {
    const escaped = renderCard({ username: '<&">', counts });

    expect(escaped).toContain('@&lt;&amp;&quot;&gt;');
    expect(escaped).not.toContain('<&');
  });
});

describe('renderMissingCard', () => {
  it('says there is no snapshot and where to build one', () => {
    const svg = renderMissingCard('Octocat');

    expect(svg).toContain('@Octocat');
    expect(svg).toContain('No snapshot yet');
    expect(svg).toContain('ghreactions.io/u/octocat');
  });
});
