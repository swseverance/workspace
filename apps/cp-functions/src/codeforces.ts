const API_BASE = 'https://codeforces.com/api';

interface CodeforcesApiResponse<T> {
  status: 'OK' | 'FAILED';
  result?: T;
  comment?: string;
}

export interface UserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

export interface Contest {
  id: number;
  name: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds: number;
}

async function callCodeforcesApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(
      `Codeforces API request to ${path} failed with status ${response.status}`,
    );
  }
  const body = (await response.json()) as CodeforcesApiResponse<T>;
  if (body.status !== 'OK' || body.result === undefined) {
    throw new Error(
      `Codeforces API error for ${path}: ${body.comment ?? 'unknown error'}`,
    );
  }
  return body.result;
}

export async function getUserInfo(handle: string): Promise<UserInfo> {
  const [user] = await callCodeforcesApi<UserInfo[]>(
    `user.info?handles=${encodeURIComponent(handle)}`,
  );
  return user;
}

export async function getUpcomingContests(): Promise<Contest[]> {
  const contests = await callCodeforcesApi<Contest[]>('contest.list?gym=false');
  return contests
    .filter((contest) => contest.phase === 'BEFORE')
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
}
