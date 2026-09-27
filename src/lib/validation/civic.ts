import { z } from 'zod';
import { SCOPES, VERDICTS, EVIDENCE_LABELS, AUTHORITIES, ACTION_TYPES } from '@/lib/civic/labels';

export const voteNewsSchema = z.object({
  verdict: z.enum(VERDICTS),
  reason: z.string().min(3, 'Please give a short reason.').max(300),
});

export const createNewsSchema = z.object({
  scope: z.enum(SCOPES),
  authority: z.enum(AUTHORITIES).default('OTHER'),
  title: z.string().min(8).max(200),
  actorType: z.string().min(2).max(80),
  actorName: z.string().max(120).optional(),
  actionType: z.enum(ACTION_TYPES).optional(),
  jurisdiction: z.string().max(120).optional(),
  whatHappened: z.string().min(20).max(6000),
  whyItMatters: z.string().min(10).max(3000),
  nextStep: z.string().max(600).optional(),
  pros: z.array(z.string().min(2).max(300)).max(8).default([]),
  cons: z.array(z.string().min(2).max(300)).max(8).default([]),
  alternatives: z.array(z.string().min(2).max(300)).max(8).default([]),
  powerMap: z.array(z.string().min(2).max(300)).max(8).default([]),
  process: z.object({
    recordedVote: z.boolean().nullable().optional(),
    publicNotice: z.boolean().nullable().optional(),
    amendmentPosted: z.boolean().nullable().optional(),
    meetingRecorded: z.boolean().nullable().optional(),
    publicComment: z.boolean().nullable().optional(),
    procedureLegal: z.boolean().nullable().optional(),
  }).default({}),
  impactLevel: z.number().int().min(0).max(5).default(0),
  sources: z.array(z.object({
    label: z.enum(EVIDENCE_LABELS),
    title: z.string().min(2).max(200),
    url: z.string().url().max(600).optional(),
  })).max(20).default([]),
});
