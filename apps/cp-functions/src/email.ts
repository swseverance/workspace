import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import nodemailer from 'nodemailer';
import type { AtCoderContest, AtCoderUserInfo } from './atcoder';
import type { Contest, UserInfo } from './codeforces';

const EASTERN_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
});

function formatEasternTime(startTimeSeconds: number): string {
  return EASTERN_TIME_FORMATTER.format(new Date(startTimeSeconds * 1000));
}

function isDiv3(contestName: string): boolean {
  return /div(?:ision)?\.?\s*3/i.test(contestName);
}

export function buildEmailHtml(user: UserInfo, contests: Contest[]): string {
  const ratingLine =
    user.rating !== undefined
      ? `${user.rating} (${user.rank ?? 'unrated'})`
      : 'Unrated';

  const contestRows =
    contests.length > 0
      ? contests
          .map((contest) => {
            const rowStyle = isDiv3(contest.name)
              ? 'padding: 6px 12px; border-bottom: 1px solid #eee; background-color: #ffe0b2; color: #a04d00; font-weight: bold;'
              : 'padding: 6px 12px; border-bottom: 1px solid #eee;';
            return `
          <tr>
            <td style="${rowStyle}">${contest.name}</td>
            <td style="${rowStyle} white-space: nowrap;">${formatEasternTime(contest.startTimeSeconds)}</td>
          </tr>`;
          })
          .join('')
      : `<tr><td colspan="2" style="padding: 6px 12px;">No upcoming contests scheduled.</td></tr>`;

  return `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 600px;">
      <h2>Codeforces Daily Update</h2>
      <p><strong>${user.handle}</strong> current rating: <strong>${ratingLine}</strong></p>
      <h3>Upcoming Contests</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 6px 12px; border-bottom: 2px solid #333;">Contest</th>
            <th style="text-align: left; padding: 6px 12px; border-bottom: 2px solid #333;">Start (Eastern)</th>
          </tr>
        </thead>
        <tbody>${contestRows}</tbody>
      </table>
    </div>
  `;
}

function isAbc(contestTitle: string): boolean {
  return /^AtCoder Beginner Contest/i.test(contestTitle);
}

export function buildAtCoderEmailHtml(
  user: AtCoderUserInfo,
  contests: AtCoderContest[],
): string {
  const ratingLine =
    user.rating !== undefined
      ? `${user.rating} (${user.rank ?? 'unrated'})`
      : 'Unrated';

  const contestRows =
    contests.length > 0
      ? contests
          .map((contest) => {
            const rowStyle = isAbc(contest.title)
              ? 'padding: 6px 12px; border-bottom: 1px solid #eee; background-color: #ffe0b2; color: #a04d00; font-weight: bold;'
              : 'padding: 6px 12px; border-bottom: 1px solid #eee;';
            return `
          <tr>
            <td style="${rowStyle}">${contest.title}</td>
            <td style="${rowStyle} white-space: nowrap;">${formatEasternTime(contest.startTimeSeconds)}</td>
          </tr>`;
          })
          .join('')
      : `<tr><td colspan="2" style="padding: 6px 12px;">No upcoming contests scheduled.</td></tr>`;

  return `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 600px;">
      <h2>AtCoder Daily Update</h2>
      <p><strong>${user.handle}</strong> current rating: <strong>${ratingLine}</strong></p>
      <h3>Upcoming Contests</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 6px 12px; border-bottom: 2px solid #333;">Contest</th>
            <th style="text-align: left; padding: 6px 12px; border-bottom: 2px solid #333;">Start (Eastern)</th>
          </tr>
        </thead>
        <tbody>${contestRows}</tbody>
      </table>
    </div>
  `;
}

export interface SendEmailParams {
  gmailUser: string;
  gmailAppPassword: string;
  toEmail: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  // In the emulator nothing is sent: the email is written to a file to open in
  // a browser, so local development needs no real Gmail credentials.
  //
  // The files land in dist/apps/cp-functions/emulator-emails/ (codeforces.html
  // and atcoder.html), because the emulator runs from the build output. On the
  // Mac that is ~/Documents/workspace/dist/apps/cp-functions/emulator-emails/.
  // dist is gitignored, and each build clears the folder.
  if (process.env['FUNCTIONS_EMULATOR'] === 'true') {
    const dir = join(process.cwd(), 'emulator-emails');
    const file = join(
      dir,
      `${params.subject.split(' ')[0].toLowerCase()}.html`,
    );
    await mkdir(dir, { recursive: true });
    await writeFile(file, params.html);
    console.log(`Emulator: "${params.subject}" written to ${file}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: params.gmailUser,
      pass: params.gmailAppPassword,
    },
  });

  await transporter.sendMail({
    from: params.gmailUser,
    to: params.toEmail,
    subject: params.subject,
    html: params.html,
  });
}
