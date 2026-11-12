import { describe, expect, it, vi } from 'vitest';
import { profiles } from '../api/profile.handler';
import { sitemapPaths } from './sitemap-paths';

describe('sitemapPaths', () => {
  it('lists each profile tab with rows, lowercased and sorted', async () => {
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
      '/u/jakewharton/pull-requests',
      '/u/tj/issues',
      '/u/tj/issue-comments',
    ]);
  });
});
