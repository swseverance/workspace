import * as logger from 'firebase-functions/logger';
import { TablePage } from '../../../models/table';
import { PAGE_SIZE } from './client';

/** Fetches up to `limit` rows after `cursor`. */
export type PageFetcher = (
  limit: number,
  cursor: string | null | undefined,
) => Promise<TablePage>;

// Bounds a result set that keeps returning short pages.
const MAX_FETCHES = 5;

/**
 * Returns a full page of PAGE_SIZE rows unless the results run out.
 *
 * GitHub sometimes returns fewer rows than requested while saying there are
 * more. The client's infinite row model assumes every block but the last is
 * full, so a short page renders as blank rows. This tops the page up from
 * where it left off.
 */
export async function fillPage(
  fetchPage: PageFetcher,
  cursor: string | null | undefined,
): Promise<TablePage> {
  const rows: TablePage['rows'] = [];
  let nextCursor = cursor;
  let fetches = 0;

  do {
    const page = await fetchPage(PAGE_SIZE - rows.length, nextCursor);
    rows.push(...page.rows);
    nextCursor = page.nextCursor;
    fetches++;
  } while (nextCursor && rows.length < PAGE_SIZE && fetches < MAX_FETCHES);

  if (fetches > 1) {
    logger.warn('[github] short page topped up', {
      fetches,
      rows: rows.length,
      full: rows.length >= PAGE_SIZE || !nextCursor,
    });
  }

  return { rows, nextCursor: nextCursor ?? null };
}
