import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { applyForJournalist } from '@/lib/reports/journalist';
import { contributorRecord } from '@/lib/reports/record';
import { ok, fail } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// GET: show the applicant their current record + eligibility.
export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in first.', 401);
  return ok({ record: await contributorRecord(user.id) });
});

// POST: apply — grants the journalist lane if the record qualifies.
export const POST = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in first.', 401);
  const result = await applyForJournalist(user.id);
  return ok(result);
});
