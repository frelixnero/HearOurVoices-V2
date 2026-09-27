import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok } from '@/lib/http/responses';
import { listLeads } from '@/lib/leads/service';

export const dynamic = 'force-dynamic';

// Lists NEW leads awaiting staff triage. Admin-only.
export const GET = handle(async () => {
  await requireAdmin();
  return ok(await listLeads('NEW'));
});
