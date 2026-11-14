import { GHReactionsRow, ReadProfile } from '@org/ghreactions-github';
import { Timestamp } from 'firebase-admin/firestore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { profiles } from '../api/profile.handler';
import { cardHandler, positiveCounts } from './card.handler';

vi.mock('firebase-functions/logger', () => ({ error: vi.fn() }));

// Spec files share modules here, so put back whatever the tests replace.
const real = { get: profiles.get, renew: profiles.renew };

afterEach(() => {
  profiles.get = real.get;
  profiles.renew = real.renew;
  vi.useRealTimers();
});

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-14T12:00:00Z');

const row = (reactions: GHReactionsRow['reactions']) =>
  ({ reactions }) as GHReactionsRow;

const profile = (fields: Partial<ReadProfile> = {}): ReadProfile => ({
  username: 'Octocat',
  status: 'ok',
  issues: [row({ THUMBS_UP: 5, THUMBS_DOWN: 9, HEART: 1 })],
  pullRequests: [row({ THUMBS_UP: 2, ROCKET: 3, EYES: 4 })],
  issueComments: [row({ THUMBS_UP: 100, LAUGH: 100 })],
  counts: { issues: 1, pullRequests: 1, issueComments: 1 },
  reactions: { issues: 15, pullRequests: 9, issueComments: 200 },
  totalReactions: 224,
  created: Timestamp.fromDate(NOW),
  lastUpdated: Timestamp.fromDate(NOW),
  lastFetched: Timestamp.fromDate(NOW),
  ...fields,
});

function makeRes() {
  const res = {
    status: vi.fn(),
    type: vi.fn(),
    set: vi.fn(),
    send: vi.fn(),
  } as any;
  res.status.mockReturnValue(res);
  res.type.mockReturnValue(res);
  res.set.mockReturnValue(res);
  return res;
}

const request = (file: string, query: Record<string, string> = {}) =>
  ({ params: { file }, query }) as any;
const next = vi.fn();

describe('positiveCounts', () => {
  it('sums positive reactions over issues and pull requests only', () => {
    expect(positiveCounts(profile())).toEqual({
      THUMBS_UP: 7,
      HEART: 1,
      HOORAY: 0,
      ROCKET: 3,
      LAUGH: 0,
    });
  });
});

describe('cardHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    profiles.get = vi.fn().mockResolvedValue(profile());
    profiles.renew = vi.fn().mockResolvedValue(undefined);
  });

  it("sends the user's card as a cacheable SVG", async () => {
    const res = makeRes();

    await cardHandler(request('octocat.svg'), res, next);

    expect(profiles.get).toHaveBeenCalledWith('octocat');
    expect(res.type).toHaveBeenCalledWith('image/svg+xml');
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600',
    );
    // Under the name as GitHub spells it, with the total: 7 + 1 + 3.
    expect(res.send.mock.calls[0][0]).toContain('@Octocat');
    expect(res.send.mock.calls[0][0]).toContain('>11<');
  });

  it.each(['light', 'dark'] as const)(
    'fixes the colours for ?theme=%s',
    async (theme) => {
      const res = makeRes();

      await cardHandler(request('octocat.svg', { theme }), res, next);

      const svg = res.send.mock.calls[0][0] as string;
      expect(svg).not.toContain('prefers-color-scheme');
      expect(svg).toContain(theme === 'dark' ? '#0d1117' : '#ffffff');
      expect(svg).not.toContain(theme === 'dark' ? '#ffffff' : '#0d1117');
    },
  );

  it("follows the viewer's system setting without a theme, or a bad one", async () => {
    const res = makeRes();

    await cardHandler(request('octocat.svg', { theme: 'pink' }), res, next);

    expect(res.send.mock.calls[0][0]).toContain('prefers-color-scheme: dark');
  });

  it('sends a "no snapshot" card, kept briefly, when there is none', async () => {
    profiles.get = vi.fn().mockResolvedValue(undefined);
    const res = makeRes();

    await cardHandler(request('octocat.svg'), res, next);

    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, s-maxage=300',
    );
    expect(res.send.mock.calls[0][0]).toContain('No snapshot yet');
  });

  it('treats a profile not fetched yet as no snapshot', async () => {
    profiles.get = vi.fn().mockResolvedValue(profile({ status: 'pending' }));
    const res = makeRes();

    await cardHandler(request('octocat.svg'), res, next);

    expect(res.send.mock.calls[0][0]).toContain('No snapshot yet');
  });

  it.each(['octocat', 'octocat.png', 'not a name.svg', '-bad.svg', '.svg'])(
    'answers 404 without a read for %s',
    async (file) => {
      const res = makeRes();

      await cardHandler(request(file), res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(profiles.get).not.toHaveBeenCalled();
    },
  );

  it('answers 500 when the read fails', async () => {
    profiles.get = vi.fn().mockRejectedValue(new Error('boom'));
    const res = makeRes();

    await cardHandler(request('octocat.svg'), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  describe('renewing the expiry', () => {
    const expiringIn = (days: number) =>
      profile({
        ranked: false,
        expireAt: Timestamp.fromMillis(NOW.getTime() + days * DAY_MS),
      });

    it('renews a requested snapshot whose expiry is over a day old', async () => {
      profiles.get = vi.fn().mockResolvedValue(expiringIn(28));

      await cardHandler(request('octocat.svg'), makeRes(), next);

      expect(profiles.renew).toHaveBeenCalledWith('octocat');
    });

    it('leaves one renewed within the last day', async () => {
      profiles.get = vi.fn().mockResolvedValue(expiringIn(29.5));

      await cardHandler(request('octocat.svg'), makeRes(), next);

      expect(profiles.renew).not.toHaveBeenCalled();
    });

    it('never gives a ranked snapshot an expiry', async () => {
      profiles.get = vi.fn().mockResolvedValue(profile({ ranked: true }));

      await cardHandler(request('octocat.svg'), makeRes(), next);

      expect(profiles.renew).not.toHaveBeenCalled();
    });

    it('still sends the card when renewing fails', async () => {
      profiles.get = vi.fn().mockResolvedValue(expiringIn(2));
      profiles.renew = vi.fn().mockRejectedValue(new Error('boom'));
      const res = makeRes();

      await cardHandler(request('octocat.svg'), res, next);

      expect(res.send.mock.calls[0][0]).toContain('@Octocat');
    });
  });
});
