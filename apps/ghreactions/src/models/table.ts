import { ReactionType } from './github';

export type GHReactionsRow = {
  type:
    | 'Pull Request'
    | 'Commit Comment'
    | 'Issue'
    | 'Issue Comment'
    | 'Pull Request Comment';
  id: string;
  url: string;
  content: string;
  state: string;
  updatedAt: string;
  reactions: Partial<Record<ReactionType, number>>;
  total: number;
  repository: string;
};

export type TablePage = { rows: GHReactionsRow[]; nextCursor: string | null };
