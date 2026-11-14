/** The reactions the card counts as positive, in the order it shows them. */
export const POSITIVE_REACTIONS = [
  { content: 'THUMBS_UP', emoji: '👍' },
  { content: 'HEART', emoji: '❤️' },
  { content: 'HOORAY', emoji: '🎉' },
  { content: 'ROCKET', emoji: '🚀' },
  { content: 'LAUGH', emoji: '😄' },
] as const;

export type PositiveReaction = (typeof POSITIVE_REACTIONS)[number]['content'];

/**
 * Fixed colours, for where the card can't tell: GitHub's own theme setting
 * (its #gh-dark-mode-only images) and this site's. Without one the card
 * follows the viewer's system setting.
 */
export type CardTheme = 'light' | 'dark';

export type CardData = {
  username: string;
  theme?: CardTheme;
  /** Positive reactions to the user's issues and pull requests, by kind. */
  counts: Record<PositiveReaction, number>;
};

const WIDTH = 460;
const HEIGHT = 176;
const MARGIN = 24;
const PILL_GAP = 8;
const PILL_WIDTH =
  (WIDTH - 2 * MARGIN - PILL_GAP * (POSITIVE_REACTIONS.length - 1)) /
  POSITIVE_REACTIONS.length;

const escapeXml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** 950, 1.2k, 12k, 3.4m: short enough to fit a pill whatever the count. */
export function compactCount(count: number): string {
  const short = (value: number, unit: string): string =>
    `${value < 10 ? Math.floor(value * 10) / 10 : Math.floor(value)}${unit}`;

  if (count < 1000) {
    return String(count);
  }

  return count < 1_000_000
    ? short(count / 1000, 'k')
    : short(count / 1_000_000, 'm');
}

/** The card's outline and colours, around whatever it says. */
function frame(
  label: string,
  content: string,
  theme: CardTheme | undefined,
): string {
  const light = `
    .card { fill: #ffffff; stroke: #d0d7de; }
    .pill { fill: #f6f8fa; stroke: #d0d7de; }
    .strong { fill: #1f2328; }
    .muted { fill: #656d76; }`;
  const dark = `
    .card { fill: #0d1117; stroke: #30363d; }
    .pill { fill: #161b22; stroke: #30363d; }
    .strong { fill: #e6edf3; }
    .muted { fill: #8d96a0; }`;
  const colours =
    theme === 'light'
      ? light
      : theme === 'dark'
        ? dark
        : `${light}
    @media (prefers-color-scheme: dark) {${dark}
    }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${label}">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
${colours}
  </style>
  <rect class="card" x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10"/>
  <text class="muted" x="${WIDTH - MARGIN}" y="36" font-size="12" text-anchor="end">ghreactions.io</text>${content}
</svg>
`;
}

/**
 * The card people embed in their GitHub profile README. GitHub serves it as a
 * plain image, so it holds no links, scripts or outside resources; the
 * Markdown around it links to the snapshot. Colours follow the viewer's light
 * or dark mode, and emoji are drawn by the viewer's own device.
 */
export function renderCard({ username, counts, theme }: CardData): string {
  const total = POSITIVE_REACTIONS.reduce(
    (sum, { content }) => sum + counts[content],
    0,
  );
  const name = escapeXml(username);

  const pills = POSITIVE_REACTIONS.map(({ content, emoji }, index) => {
    const x = MARGIN + index * (PILL_WIDTH + PILL_GAP);

    // One text element, anchored in the middle, so the emoji and its count
    // are centred as a pair whatever the count's width. The gap is an en
    // space, not dx: browsers disagree on whether dx counts when centring.

    return `
  <rect class="pill" x="${x + 0.5}" y="118.5" width="${PILL_WIDTH - 1}" height="33" rx="17"/>
  <text x="${x + PILL_WIDTH / 2}" y="141" text-anchor="middle"><tspan font-size="16">${emoji}</tspan><tspan class="strong" dy="-1" font-size="13" font-weight="600">&#8194;${compactCount(counts[content])}</tspan></text>`;
  }).join('');

  return frame(
    `${name} has ${total.toLocaleString('en-US')} positive reactions on GitHub issues and pull requests`,
    `
  <text class="strong" x="${MARGIN}" y="36" font-size="15" font-weight="600">@${name}</text>
  <text class="strong" x="${MARGIN}" y="82" font-size="38" font-weight="700">${total.toLocaleString('en-US')}</text>
  <text class="muted" x="${MARGIN}" y="104" font-size="13">positive reactions to issues and pull requests</text>${pills}`,
    theme,
  );
}

/** The card for a user with no snapshot: says so, and where to get one. */
export function renderMissingCard(username: string, theme?: CardTheme): string {
  const name = escapeXml(username);

  return frame(
    `No ghreactions.io snapshot for ${name} yet`,
    `
  <text class="strong" x="${MARGIN}" y="36" font-size="15" font-weight="600">@${name}</text>
  <text class="strong" x="${MARGIN}" y="88" font-size="22" font-weight="700">No snapshot yet</text>
  <text class="muted" x="${MARGIN}" y="114" font-size="13">Build one at ghreactions.io/u/${name.toLowerCase()}</text>`,
    theme,
  );
}
