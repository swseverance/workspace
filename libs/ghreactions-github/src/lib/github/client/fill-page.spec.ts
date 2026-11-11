import { GHReactionsRow, TablePage } from '../../../models/table';
import { PAGE_SIZE } from './client';
import { fillPage, PageFetcher } from './fill-page';

const rows = (n: number, from = 0) =>
  Array.from({ length: n }, (_, i) => ({
    id: `r${from + i}`,
  })) as unknown as GHReactionsRow[];

/** Serves `pages` in order, recording each call's limit and cursor. */
function fetcher(pages: TablePage[]) {
  return vi.fn<PageFetcher>(async () => pages.shift()!);
}

describe('fillPage', () => {
  it('returns a full page from a single fetch', async () => {
    const fetch = fetcher([{ rows: rows(PAGE_SIZE), nextCursor: 'c1' }]);

    const page = await fillPage(fetch, null);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(PAGE_SIZE, null);
    expect(page.rows).toHaveLength(PAGE_SIZE);
    expect(page.nextCursor).toBe('c1');
  });

  it('tops up a short page from its cursor, asking only for the shortfall', async () => {
    const fetch = fetcher([
      { rows: rows(60), nextCursor: 'c1' },
      { rows: rows(40, 60), nextCursor: 'c2' },
    ]);

    const page = await fillPage(fetch, 'c0');

    expect(fetch).toHaveBeenNthCalledWith(1, PAGE_SIZE, 'c0');
    expect(fetch).toHaveBeenNthCalledWith(2, 40, 'c1');
    expect(page.rows).toHaveLength(PAGE_SIZE);
    expect(page.rows.at(-1)).toEqual({ id: 'r99' });
    expect(page.nextCursor).toBe('c2');
  });

  it('stops when the results run out', async () => {
    const fetch = fetcher([
      { rows: rows(60), nextCursor: 'c1' },
      { rows: rows(10, 60), nextCursor: null },
    ]);

    const page = await fillPage(fetch, null);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(page.rows).toHaveLength(70);
    expect(page.nextCursor).toBeNull();
  });

  it('gives up after a bounded number of fetches', async () => {
    const fetch = vi.fn<PageFetcher>(async () => ({
      rows: [],
      nextCursor: 'more',
    }));

    const page = await fillPage(fetch, null);

    expect(fetch).toHaveBeenCalledTimes(5);
    expect(page).toEqual({ rows: [], nextCursor: 'more' });
  });
});
