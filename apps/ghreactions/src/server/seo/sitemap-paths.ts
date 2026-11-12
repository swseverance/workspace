import { PROFILE_TABS } from '../../app/components/profile/tabs';
import { profiles } from '../api/profile.handler';
import { USERS_PAGE_SIZE } from '../api/users.handler';

/**
 * The home, search and users pages, plus each indexed user's tabs that have
 * rows. Empty tabs and users below MIN_INDEXED_REACTIONS are noindex, so
 * they're left out.
 */
export async function sitemapPaths(): Promise<string[]> {
  const [summaries, ranked] = await Promise.all([
    profiles.summaries(),
    profiles.rankedCount(),
  ]);
  const userPages = Array.from(
    { length: Math.ceil(ranked / USERS_PAGE_SIZE) - 1 },
    (_, i) => `/users/${i + 2}`,
  );
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

  return ['/', '/search', '/users', ...userPages, ...profilePaths];
}
