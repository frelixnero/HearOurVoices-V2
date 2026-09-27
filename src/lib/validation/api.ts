// Zod schemas for the phase-2+ API surface. Every input is validated (§45 rule 3).
import { z } from 'zod';

export const createEvidenceSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  evidenceType: z.string().min(2).max(40),
  contentBase64: z.string().min(1).max(50_000_000), // ~37MB decoded cap for dev
  mimeType: z.string().min(3).max(120),
  filename: z.string().min(1).max(255),
});

export const redactionSchema = z.object({
  redactedBase64: z.string().min(1).max(50_000_000),
  reason: z.string().min(3).max(500),
  makePublic: z.boolean().optional(),
});

export const reviewSchema = z.object({
  reviewType: z.enum(['research', 'legal', 'safety', 'duplicate']),
  decision: z.enum(['approve', 'reject', 'needs_evidence', 'escalate']),
  rationale: z.string().min(3).max(2000),
});

export const publishClaimSchema = z.object({
  confidenceLabel: z.enum([
    'VERIFIED', 'STRONGLY_SUPPORTED', 'PARTIALLY_SUPPORTED', 'UNCLEAR', 'DISPUTED',
    'UNSUPPORTED', 'MISLEADING', 'FALSE', 'OUTDATED', 'CANNOT_BE_VERIFIED',
  ]),
});

export const officialResponseSchema = z.object({
  responseType: z.enum(['context', 'dispute', 'correction_request', 'official_statement', 'appeal']),
  body: z.string().min(5).max(5000),
});

export const moderationReportSchema = z.object({
  contentType: z.string().min(2).max(40),
  contentId: z.string().min(1).max(60),
  reason: z.string().min(2).max(60),
  details: z.string().max(2000).optional(),
});

export const moderationActionSchema = z.object({
  contentType: z.string().min(2).max(40),
  contentId: z.string().min(1).max(60),
  actionType: z.enum(['limit', 'remove', 'needs_evidence', 'needs_redaction', 'legal_hold']),
  reason: z.string().min(2).max(60),
  publicExplanation: z.string().min(3).max(2000),
});

export const createCampaignSchema = z.object({
  campaignType: z.string().min(2).max(40),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  jurisdictionId: z.string().max(40).optional(),
  goalAmountCents: z.number().int().positive().max(1_000_000_00),
  refundPolicy: z.string().min(5).max(1000),
});

// Only the amount comes from the client — fees are computed server-side (§16.7).
export const contributeSchema = z.object({
  amountCents: z.number().int().positive().max(1_000_000_00),
});

export const expenseSchema = z.object({
  category: z.string().min(2).max(60),
  vendor: z.string().min(1).max(200),
  amountCents: z.number().int().positive().max(1_000_000_00),
  description: z.string().min(3).max(1000),
});

export const createPetitionSchema = z.object({
  title: z.string().min(5).max(200),
  requestText: z.string().min(20).max(5000),
  targetType: z.string().min(2).max(40),
  targetId: z.string().max(40).optional(),
  jurisdictionId: z.string().max(40).optional(),
  signatureGoal: z.number().int().positive().max(10_000_000).optional(),
});

export const recordsRequestSchema = z.object({
  title: z.string().min(3).max(200),
  requestText: z.string().min(10).max(5000),
  agencyId: z.string().max(40).optional(),
  jurisdictionId: z.string().max(40).optional(),
  feeLimitCents: z.number().int().min(0).optional(),
  public: z.boolean().optional(),
});
