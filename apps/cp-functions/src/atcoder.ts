const CONTESTS_PAGE_URL = 'https://atcoder.jp/contests/?lang=en';

interface AtCoderContestHistoryEntry {
  IsRated: boolean;
  NewRating: number;
}

export interface AtCoderUserInfo {
  handle: string;
  rating?: number;
  rank?: string;
}

export interface AtCoderContest {
  id: string;
  title: string;
  startTimeSeconds: number;
  durationSeconds: number;
}

function ratingToRank(rating: number): string {
  if (rating >= 2800) return 'red';
  if (rating >= 2400) return 'orange';
  if (rating >= 2000) return 'yellow';
  if (rating >= 1600) return 'blue';
  if (rating >= 1200) return 'cyan';
  if (rating >= 800) return 'green';
  if (rating >= 400) return 'brown';
  return 'gray';
}

export async function getUserInfo(handle: string): Promise<AtCoderUserInfo> {
  const response = await fetch(
    `https://atcoder.jp/users/${encodeURIComponent(handle)}/history/json`,
  );
  if (!response.ok) {
    throw new Error(
      `AtCoder history request for ${handle} failed with status ${response.status}`,
    );
  }
  const history = (await response.json()) as AtCoderContestHistoryEntry[];
  const ratedHistory = history.filter((entry) => entry.IsRated);
  const latest = ratedHistory[ratedHistory.length - 1];
  if (!latest) {
    return { handle };
  }
  return {
    handle,
    rating: latest.NewRating,
    rank: ratingToRank(latest.NewRating),
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseDurationToSeconds(durationText: string): number {
  const [hours, minutes] = durationText.trim().split(':').map(Number);
  return hours * 3600 + minutes * 60;
}

function extractUpcomingContestsSection(html: string): string {
  const startMarker = 'id="contest-table-upcoming"';
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error(
      'Could not find upcoming contests section on AtCoder contests page',
    );
  }
  const endIndex = html.indexOf(
    'id="contest-table-',
    startIndex + startMarker.length,
  );
  return html.slice(startIndex, endIndex === -1 ? undefined : endIndex);
}

export async function getUpcomingContests(): Promise<AtCoderContest[]> {
  const response = await fetch(CONTESTS_PAGE_URL);
  if (!response.ok) {
    throw new Error(
      `AtCoder contests page request failed with status ${response.status}`,
    );
  }
  const html = await response.text();
  const section = extractUpcomingContestsSection(html);

  const contests: AtCoderContest[] = [];
  for (const rowMatch of section.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const row = rowMatch[1];
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
      (m) => m[1],
    );
    if (cells.length < 3) continue;

    const timeMatch = cells[0].match(/<time[^>]*>([^<]+)<\/time>/);
    const nameMatch = cells[1].match(
      /<a href="\/contests\/([a-zA-Z0-9_-]+)">([^<]+)<\/a>/,
    );
    if (!timeMatch || !nameMatch) continue;

    const startTimeSeconds =
      Date.parse(timeMatch[1].trim().replace(' ', 'T')) / 1000;
    contests.push({
      id: nameMatch[1],
      title: decodeHtmlEntities(nameMatch[2]),
      startTimeSeconds,
      durationSeconds: parseDurationToSeconds(cells[2]),
    });
  }

  return contests.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
}
