import { prisma } from '@/lib/db/client';
import { handle } from '@/lib/http/route';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Liveness + DB readiness for ops/monitoring (spec §32 monitoring). Never throws
// on a missing DB — reports connectivity instead so a probe gets a clean answer.
export const GET = handle(async () => {
  let db: 'connected' | 'unavailable' = 'unavailable';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'connected';
  } catch {
    db = 'unavailable';
  }
  return ok({ status: 'ok', db, time: new Date().toISOString() });
});
