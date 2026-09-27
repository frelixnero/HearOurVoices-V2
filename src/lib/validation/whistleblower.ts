import { z } from 'zod';
import { TIP_CATEGORIES } from '@/lib/whistleblower/service';

export const tipSchema = z.object({
  message: z.string().min(20, 'Please describe what happened (at least a sentence or two).').max(8000),
  category: z.enum(TIP_CATEGORIES).optional(),
});

export const tipStatusSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'ARCHIVED']),
});
