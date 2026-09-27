// Honor Vault service. Heroes are created by staff (moderated). Read is public.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { TOKEN_FIELD, type HonorCategory, type HonorQuote, type KeyDate, type TokenKey } from './labels';

export interface CreateHeroInput {
  createdBy: string;
  heroName: string;
  rank?: string;
  branch?: string;
  category: HonorCategory;
  homeState?: string;
  conflictOrEra?: string;
  memoryLockPrimary: string;
  memoryLockSacrifice: string;
  serviceSummary?: string;
  momentOfCourage?: string;
  legacyImpact?: string;
  medals: string[];
  memoryPhrases: string[];
  chainOfInfluence: string[];
  quotes: HonorQuote[];
  keyDates: KeyDate[];
  spotlightLevel?: number;
}

export async function createHero(input: CreateHeroInput) {
  const spotlightLevel = Math.max(0, Math.min(3, input.spotlightLevel ?? 0));
  const h = await prisma.honorHero.create({
    data: {
      createdBy: input.createdBy, heroName: input.heroName, rank: input.rank ?? null, branch: input.branch ?? null,
      category: input.category, homeState: input.homeState ?? null, conflictOrEra: input.conflictOrEra ?? null,
      memoryLockPrimary: input.memoryLockPrimary, memoryLockSacrifice: input.memoryLockSacrifice,
      serviceSummary: input.serviceSummary ?? null, momentOfCourage: input.momentOfCourage ?? null,
      legacyImpact: input.legacyImpact ?? null, medals: input.medals, memoryPhrases: input.memoryPhrases,
      chainOfInfluence: input.chainOfInfluence, quotes: input.quotes as never, keyDates: input.keyDates as never,
      spotlightLevel, publishState: 'PUBLISHED', publishedAt: new Date(),
    },
  });
  await writeAudit({ actorUserId: input.createdBy, action: 'honor.hero_published', entityType: 'honor_hero', entityId: h.id, after: { spotlightLevel } });
  return h;
}

export async function listHeroes(opts: { category?: HonorCategory; take?: number } = {}) {
  return prisma.honorHero.findMany({
    where: { publishState: 'PUBLISHED', ...(opts.category ? { category: opts.category } : {}) },
    orderBy: [{ spotlightLevel: 'desc' }, { honorScore: 'desc' }, { createdAt: 'desc' }],
    take: Math.min(opts.take ?? 100, 200),
  });
}

export async function getHero(id: string) {
  const hero = await prisma.honorHero.findFirst({ where: { id, publishState: 'PUBLISHED' } });
  if (!hero) return null;
  const [tributes, tributeCount] = await Promise.all([
    prisma.honorTribute.findMany({ where: { heroId: id, status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 100 }),
    prisma.honorTribute.count({ where: { heroId: id, status: 'PUBLISHED' } }),
  ]);
  return { ...hero, tributes, tributeCount };
}

/** Leave a remembrance token (candle/coin/flag/stone/flower). Tokens accumulate. */
export async function leaveToken(id: string, type: TokenKey) {
  const field = TOKEN_FIELD[type];
  const h = await prisma.honorHero.update({
    where: { id }, data: { [field]: { increment: 1 } },
    select: { candles: true, coins: true, flags: true, stones: true, flowers: true },
  });
  return h;
}

/** Submit a tribute to the wall — held for moderation before it appears. */
export async function addTribute(input: { heroId: string; displayName?: string; relationship?: string; message: string }) {
  const t = await prisma.honorTribute.create({
    data: {
      heroId: input.heroId,
      displayName: input.displayName?.trim() || 'Anonymous',
      relationship: input.relationship?.trim() || null,
      message: input.message.trim(),
      status: 'PENDING_REVIEW',
    },
  });
  return t.id;
}

/** One hero to feature (highest spotlight, highest honor). */
export async function featuredHero() {
  return prisma.honorHero.findFirst({
    where: { publishState: 'PUBLISHED', spotlightLevel: { gte: 2 } },
    orderBy: [{ spotlightLevel: 'desc' }, { honorScore: 'desc' }],
  });
}
