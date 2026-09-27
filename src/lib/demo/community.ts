// Demo content for the Community Brief UI (spec §8, §44 — all FICTIONAL).
// Ported from the MVP front-end. This is temporary presentation data; a later
// phase replaces it with real API calls to the jurisdiction/claims endpoints.
// Nothing here refers to a real person or implies real wrongdoing (§44).

export type Status =
  | 'Verified fact'
  | 'Official statement'
  | 'Under review'
  | 'Disputed';

export interface Story {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  status: Status;
  time: string;
  sources: number;
  official?: string;
  image: string;
}

export const stories: Story[] = [
  {
    id: 'budget',
    eyebrow: 'CITY BUDGET',
    title: 'Council approves revised neighborhood street plan',
    summary:
      'The adopted plan redirects $2.4M toward three high-priority corridors after public testimony and an engineering review.',
    status: 'Verified fact',
    time: '2 hours ago',
    sources: 7,
    official: 'City Council',
    image: 'linear-gradient(135deg,#123f52,#1e6d78)',
  },
  {
    id: 'records',
    eyebrow: 'PUBLIC RECORDS',
    title: 'Police staffing records released after 41-day request',
    summary:
      'The production includes quarterly staffing totals, overtime summaries, and the city’s written response.',
    status: 'Official statement',
    time: 'Yesterday',
    sources: 4,
    official: 'Public Safety',
    image: 'linear-gradient(135deg,#873f28,#d18145)',
  },
  {
    id: 'school',
    eyebrow: 'SCHOOL DISTRICT',
    title: 'Community asks for details behind facilities contract',
    summary:
      'A documented concern is awaiting records and review. No finding of wrongdoing has been made.',
    status: 'Under review',
    time: 'Jun 28',
    sources: 3,
    official: 'School Board',
    image: 'linear-gradient(135deg,#374b63,#6d7c8e)',
  },
];

export const timeline: ReadonlyArray<readonly [string, string, string]> = [
  ['Jul 8', 'Budget amendment adopted', 'Verified fact'],
  ['Jul 2', 'Public hearing held', 'Official record'],
  ['Jun 19', 'Engineering report published', 'Source added'],
  ['May 28', 'Original proposal introduced', 'Official record'],
];
