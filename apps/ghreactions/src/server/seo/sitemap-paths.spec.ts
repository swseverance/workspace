import { describe, expect, it, vi } from 'vitest';
import { profiles } from '../api/profile.handler';
import { sitemapPaths } from './sitemap-paths';

describe('sitemapPaths', () => {
  // summaries() returns only indexed users (the query applies the minimum).
  it('lists the users pages and each profile tab with rows, lowercased and sorted', async () => {
    profiles.rankedCount = vi.fn().mockResolvedValue(250);
    profiles.summaries = vi.fn().mockResolvedValue([
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
