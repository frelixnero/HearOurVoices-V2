import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { createHeroSchema } from '@/lib/validation/honor';
import { createHero, listHeroes } from '@/lib/honor/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => ok(await listHeroes()));

// Adding a hero is a staff action (moderated).
export const POST = handle(async (req) => {
  const staff = await requireModerator();
  const body = createHeroSchema.parse(await req.json());
  const h = await createHero({ createdBy: staff.id, ...body });
  return ok({ id: h.id, spotlightLevel: h.spotlightLevel }, { status: 201 });
});
