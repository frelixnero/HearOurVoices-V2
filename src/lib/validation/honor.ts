import { z } from 'zod';
import { HONOR_CATEGORIES, TOKEN_KEYS } from '@/lib/honor/labels';

export const tokenSchema = z.object({ type: z.enum(TOKEN_KEYS as [string, ...string[]]) });

const quote = z.object({ quote: z.string().min(2).max(400), attribution: z.string().max(120).optional() });
const keyDate = z.object({ label: z.string().min(1).max(60), date: z.string().min(1).max(40) });

export const tributeSchema = z.object({
  displayName: z.string().max(80).optional(),
  relationship: z.string().max(60).optional(),
  message: z.string().min(4, 'Please write a short message.').max(1000),
});

export const createHeroSchema = z.object({
  heroName: z.string().min(2).max(120),
  rank: z.string().max(60).optional(),
  branch: z.string().max(40).optional(),
  category: z.enum(HONOR_CATEGORIES).default('FALLEN'),
  homeState: z.string().max(60).optional(),
  conflictOrEra: z.string().max(80).optional(),
  memoryLockPrimary: z.string().min(10, 'One clear sentence: what they did.').max(400),
  memoryLockSacrifice: z.string().min(10, 'One clear sentence: what they gave.').max(400),
  serviceSummary: z.string().max(400).optional(),
  momentOfCourage: z.string().max(1000).optional(),
  legacyImpact: z.string().max(1000).optional(),
  medals: z.array(z.string().min(1).max(80)).max(20).default([]),
  memoryPhrases: z.array(z.string().min(2).max(120)).max(8).default([]),
  chainOfInfluence: z.array(z.string().min(2).max(200)).max(10).default([]),
  quotes: z.array(quote).max(10).default([]),
  keyDates: z.array(keyDate).max(10).default([]),
  spotlightLevel: z.number().int().min(0).max(3).default(0),
});
