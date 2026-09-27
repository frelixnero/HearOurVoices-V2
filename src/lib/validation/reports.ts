import { z } from 'zod';
import { POST_LABELS, CLAIM_STATUSES } from '@/lib/reports/labels';

// Citizen lane: a visible label is REQUIRED so nothing looks like proven fact.
export const citizenReportSchema = z.object({
  label: z.enum(POST_LABELS),
  title: z.string().min(6, 'Add a short title.').max(200),
  body: z.string().min(10, 'Add a little more detail.').max(6000),
  topic: z.string().max(40).optional(),
  sourceUrl: z.string().url().max(600).optional().or(z.literal('')),
  anonymous: z.boolean().default(true),
});

// Journalist lane: the full structured report. Every field is required so a video
// report always says what it shows, what it does NOT prove, the exact claim, the
// origin, the response from the affected party, and disclosed conflicts.
export const journalistReportSchema = z.object({
  byline: z.string().min(2).max(80),
  title: z.string().min(8, 'Write a clear headline.').max(200),
  exactClaim: z.string().min(8, 'State the exact claim being examined.').max(500),
  videoShows: z.string().min(20, 'Describe what the video directly shows.').max(6000),
  videoDoesntProve: z.string().min(10, 'State what it does NOT prove.').max(3000),
  confirmedParts: z.string().min(10, 'Say which parts are confirmed / unconfirmed.').max(3000),
  origin: z.string().min(5, 'Where did the information originate?').max(1000),
  whyImportant: z.string().min(20, 'Explain why it matters.').max(3000),
  sourceUrl: z.string().url('Link the source video/records.').max(600),
  affectedParty: z.string().min(2, 'Name the person or agency involved.').max(200),
  affectedResponse: z.string().min(3, 'Include their response, or state they did not respond.').max(3000),
  conflicts: z.string().min(2, 'Disclose conflicts, or write “none.”').max(1000),
  neutralityAffirmed: z.literal(true, { errorMap: () => ({ message: 'You must affirm the neutrality & transparency rules.' }) }),
});

export const claimStatusSchema = z.object({
  toStatus: z.enum(CLAIM_STATUSES),
  rationale: z.string().min(5).max(2000),
});

export const correctionSchema = z.object({
  note: z.string().min(5).max(2000),
});
