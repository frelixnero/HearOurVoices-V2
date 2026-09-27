import { z } from 'zod';

export const submitRumorSchema = z.object({
  text: z.string().min(10, 'Add a little more detail.').max(600),
  topic: z.string().max(40).optional(),
  anonymous: z.boolean().default(true),
});

export const voteRumorSchema = z.object({
  vote: z.enum(['accurate', 'inaccurate']),
});

export const rumorEvidenceSchema = z.object({
  stance: z.enum(['supports', 'refutes']),
  note: z.string().min(3).max(1000),
  url: z.string().url().max(500).optional(),
  anonymous: z.boolean().default(true),
});

export const verdictSchema = z.object({
  grade: z.enum(['TRUE', 'MOSTLY_TRUE', 'MIXED', 'UNVERIFIED', 'MOSTLY_FALSE', 'FALSE']),
  rationale: z.string().min(5).max(2000),
});
