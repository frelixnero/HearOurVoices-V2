import { z } from 'zod';

export const claimTypes = [
  'OBSERVATION', 'ALLEGATION', 'OFFICIAL_STATEMENT', 'STATISTICAL_CLAIM',
  'LEGAL_CLAIM', 'FINANCIAL_CLAIM', 'PROMISE', 'PREDICTION', 'OPINION',
  'CONCLUSION', 'CORRECTION',
] as const;

export const submitClaimSchema = z.object({
  claimType: z.enum(claimTypes),
  text: z.string().min(10).max(5000),
  targetType: z.string().min(2).max(40),
  targetId: z.string().max(40).optional(),
  jurisdictionId: z.string().max(40).optional(),
  topic: z.string().max(120).optional(),
  occurredAt: z.string().datetime().optional(),
  evidenceIds: z.array(z.string().max(40)).max(50).default([]),
  // Idempotency key defends against duplicate submission (§45 rule 19).
  idempotencyKey: z.string().min(8).max(100).optional(),
});
export type SubmitClaimInput = z.infer<typeof submitClaimSchema>;
