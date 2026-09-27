import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { createCaseSchema } from '@/lib/validation/vault';
import { createCase, listCases } from '@/lib/vault/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => ok(await listCases()));

// Creating a case is a staff action (moderated) — legal safety.
export const POST = handle(async (req) => {
  const staff = await requireModerator();
  const body = createCaseSchema.parse(await req.json());
  const c = await createCase({ createdBy: staff.id, ...body });
  return ok({ id: c.id, spotlightLevel: c.spotlightLevel }, { status: 201 });
});
