import { GHReactionsRow, ReactionType } from '@org/ghreactions-github/models';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { MobileCard } from '../mobile-card/mobile-card';

export const DEFAULT_COL_DEF: ColDef<GHReactionsRow> = {
  sortable: false,
  filter: false,
  suppressMovable: true,
};

const repositoryCol: ColDef<GHReactionsRow> = {
  field: 'repository',
  width: 240,
};

const contentCol: ColDef<GHReactionsRow> = {
  field: 'content',
  width: 600,
  cellRenderer: (p: ICellRendererParams<GHReactionsRow>) => {
    if (!p.data) return '';
    const a = document.createElement('a');
    a.href = p.data.url;
    a.target = '_blank';
    a.textContent = p.value;
    return a;
  },
};

const typeCol: ColDef<GHReactionsRow> = {
  field: 'type',
  width: 200,
};

const stateCol: ColDef<GHReactionsRow> = {
  field: 'state',
  width: 100,
};

const updatedAtCol: ColDef<GHReactionsRow> = {
  field: 'updatedAt',
  headerName: 'Updated',
  width: 100,
  valueFormatter: (p) =>
    p.value
      ? new Date(p.value).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
        })
      : '',
};

const thumbsUpCol: ColDef<GHReactionsRow> = {
  headerName: '👍',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.ThumbsUp] || null,
};

const thumbsDownCol: ColDef<GHReactionsRow> = {
  headerName: '👎',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.ThumbsDown] || null,
};

const laughCol: ColDef<GHReactionsRow> = {
  headerName: '😄',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.Laugh] || null,
};

const hoorayCol: ColDef<GHReactionsRow> = {
  headerName: '🎉',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.Hooray] || null,
};

const confusedCol: ColDef<GHReactionsRow> = {
  headerName: '😕',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.Confused] || null,
};

const heartCol: ColDef<GHReactionsRow> = {
  headerName: '❤️',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.Heart] || null,
};

const rocketCol: ColDef<GHReactionsRow> = {
  headerName: '🚀',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.Rocket] || null,
};

const eyesCol: ColDef<GHReactionsRow> = {
  headerName: '👀',
  width: 80,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.reactions[ReactionType.Eyes] || null,
};

const totalCol: ColDef<GHReactionsRow> = {
  headerName: 'Total',
  width: 100,
  headerClass: 'centered-header',
  cellStyle: { textAlign: 'center' },
  valueGetter: (p) => p.data?.total || null,
};

const spacerCol: ColDef<GHReactionsRow> = {
  headerName: '',
  valueGetter: () => '',
  flex: 1,
  resizable: false,
};

const DESKTOP_COLUMNS: ColDef<GHReactionsRow>[] = [
  repositoryCol,
  contentCol,
  typeCol,
  stateCol,
  updatedAtCol,
  thumbsUpCol,
  thumbsDownCol,
  laughCol,
  hoorayCol,
  confusedCol,
  heartCol,
  rocketCol,
  eyesCol,
  totalCol,
  spacerCol,
];

const mobileCol: ColDef<GHReactionsRow> = {
  flex: 1,
  resizable: false,
  cellRenderer: MobileCard,
  headerName: 'Results',
  colId: 'reactions',
};

const MOBILE_COLUMNS: ColDef<GHReactionsRow>[] = [mobileCol];

export const COLUMNS = {
  mobile: MOBILE_COLUMNS,
  desktop: DESKTOP_COLUMNS,
};
