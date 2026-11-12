import { PROFILE_TABS } from '../../app/components/profile/tabs';
import { profiles } from '../api/profile.handler';

/**
 * The home and search pages, plus each profile tab that has rows. Empty tabs
 * are noindex, so they're left out.
 */
export async function sitemapPaths(): Promise<string[]> {
  const summaries = await profiles.summaries();
  const profilePaths = summaries
    .map(({ username, counts }) => ({
      username: username.toLowerCase(),
      counts,
    }))
    .sort((a, b) => a.username.localeCompare(b.username))
    .flatMap(({ username, counts }) =>
      PROFILE_TABS.filter((tab) => (counts?.[tab.key] ?? 0) > 0).map(
        (tab) => `/u/${username}/${tab.path}`,
      ),
    );

  return ['/', '/search', ...profilePaths];
}
