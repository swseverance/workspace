import { beforeEach, describe, expect, it, vi } from 'vitest';
import { githubClient } from '../client/client';
import { fetchTopUsers, TOP_USERS_QUERY } from './fetch-top-users';

const page = (
  logins: (string | null)[],
  hasNextPage = false,
  endCursor: string | null = null,
) => ({
  search: {
    nodes: logins.map((login) => (login === null ? {} : { login })),
    pageInfo: { hasNextPage, endCursor },
  },
});

beforeEach(() => {
  githubClient.gql = vi.fn();
});

describe('fetchTopUsers', () => {
  it('searches users by followers, 100 at a time', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(page(['a']));

    await fetchTopUsers();

    const [query, variables] = vi.mocked(githubClient.gql).mock.calls[0];
    expect(query).toContain('type: USER');
    expect(variables).toEqual({ q: TOP_USERS_QUERY, limit: 100, cursor: null });
  });

  it('follows pages until GitHub runs out', async () => {
    vi.mocked(githubClient.gql)
      .mockResolvedValueOnce(page(['a', 'b'], true, 'c1'))
      .mockResolvedValueOnce(page(['c']));

    expect(await fetchTopUsers()).toEqual(['a', 'b', 'c']);
    expect(vi.mocked(githubClient.gql).mock.calls[1][1]).toMatchObject({
      cursor: 'c1',
    });
  });

  it('skips nodes that are not users', async () => {
    vi.mocked(githubClient.gql).mockResolvedValue(page(['a', null, 'b']));

    expect(await fetchTopUsers()).toEqual(['a', 'b']);
  });

  it('stops at the limit', async () => {
    vi.mocked(githubClient.gql)
      .mockResolvedValueOnce(page(['a', 'b'], true, 'c1'))
      .mockResolvedValueOnce(page(['c', 'd'], true, 'c2'));

    expect(await fetchTopUsers(3)).toEqual(['a', 'b', 'c']);
    expect(githubClient.gql).toHaveBeenCalledTimes(2);
  });

  it('drops a user that shows up on two pages', async () => {
    vi.mocked(githubClient.gql)
      .mockResolvedValueOnce(page(['a', 'b'], true, 'c1'))
      .mockResolvedValueOnce(page(['b', 'c']));

    expect(await fetchTopUsers()).toEqual(['a', 'b', 'c']);
  });
});
