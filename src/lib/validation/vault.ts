import { z } from 'zod';
import { CASE_STATUSES, SCORE_TAGS } from '@/lib/vault/labels';

const tl = z.object({ date: z.string().max(40).optional(), label: z.string().min(1).max(60), description: z.string().min(1).max(600), scoreTag: z.enum(SCORE_TAGS).optional(), sourceUrl: z.string().url().max(600).optional() });
const act = z.object({ actorType: z.string().min(1).max(60), actorName: z.string().max(120).optional(), description: z.string().min(1).max(600), scoreTag: z.enum(SCORE_TAGS), impactWeight: z.number().int().min(1).max(10).optional() });
const q = z.object({ questionText: z.string().min(3).max(400), targetAuthority: z.string().min(1).max(80), status: z.string().max(40).default('Unanswered') });
const fl = z.object({ flag: z.string().min(2).max(120), reason: z.string().min(2).max(600) });
const src = z.object({ label: z.enum(['DOCUMENTED', 'RECORDED', 'MISSING', 'UNVERIFIED']), title: z.string().min(2).max(200), url: z.string().url().max(600).optional() });

export const createCaseSchema = z.object({
  victimName: z.string().min(2).max(120),
  victimAge: z.number().int().min(0).max(130).optional(),
  location: z.string().max(160).optional(),
  dateOfIncident: z.string().max(40).optional(),
  caseType: z.string().min(2).max(80),
  memoryLockPrimary: z.string().min(10, 'One clear sentence: what happened.').max(400),
  memoryLockFailure: z.string().min(10, 'One clear sentence: what failed.').max(400),
  status: z.enum(CASE_STATUSES).default('ACTIVE'),
  justiceGapScore: z.number().int().min(0).max(100).default(0),
  favoriteActivities: z.string().max(400).optional(),
  personalityWords: z.array(z.string().min(1).max(40)).max(8).default([]),
  whatWasLost: z.string().max(400).optional(),
  anchorPhrases: z.array(z.string().min(3).max(200)).max(6).default([]),
  timeline: z.array(tl).max(40).default([]),
  actions: z.array(act).max(40).default([]),
  questions: z.array(q).max(20).default([]),
  flags: z.array(fl).max(12).default([]),
  sources: z.array(src).max(30).default([]),
});
