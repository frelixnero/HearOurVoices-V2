import { z } from 'zod';
import { CLAIM_STATUSES } from '@/lib/reports/labels';

export const moderateSchema = z.object({ action: z.enum(['approve', 'remove']) });

export const capabilitySchema = z.object({
  capability: z.enum(['isJournalist', 'isModerator', 'isAdmin', 'suspended']),
  value: z.boolean(),
});

export const adminStatusSchema = z.object({
  toStatus: z.enum(CLAIM_STATUSES),
  rationale: z.string().min(3).max(2000),
});
