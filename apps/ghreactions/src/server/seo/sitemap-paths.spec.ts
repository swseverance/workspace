import { describe, expect, it, vi } from 'vitest';
import { profiles } from '../api/profile.handler';
import { sitemapPaths } from './sitemap-paths';

describe('sitemapPaths', () => {
  // ranked() returns only ranked users with enough reactions to be indexed.
  it('lists the users pages and each profile tab with rows, lowercased and sorted', async () => {
    profiles.ranked = vi.fn().mockResolvedValue([
      {
        username: 'tj',
        counts: { issues: 3, pullRequests: 0, issueComments: 1 },
      },
      {
        username: 'JakeWharton',
        counts: { issues: 0, pullRequests: 2, issueComments: 0 },
      },
      // Written before counts existed.
      { username: 'old' },
      // Enough others to fill three pages of /users.
      ...Array.from({ length: 247 }, (_, i) => ({
        username: `zz${i}`,
        counts: { issues: 0, pullRequests: 0, issueComments: 0 },
      })),
    ]);

    expect(await sitemapPaths()).toEqual([
      '/',
      '/search',
      '/users',
      '/users/2',
      '/users/3',
      '/u/jakewharton/pull-requests',
      '/u/tj/issues',
      '/u/tj/issue-comments',
    ]);
  });
});
