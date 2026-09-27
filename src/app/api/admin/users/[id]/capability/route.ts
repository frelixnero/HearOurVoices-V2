import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { capabilitySchema } from '@/lib/validation/admin';
import { setUserCapability } from '@/lib/admin/service';
import { ok, fail } from '@/lib/http/responses';

// Admin-only: grant/revoke journalist/moderator/admin, or suspend a user.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const admin = await requireAdmin();
  const body = capabilitySchema.parse(await req.json());
  // Guard: an admin can't strip their own admin flag (avoid locking everyone out).
  if (ctx.params.id === admin.id && body.capability === 'isAdmin' && body.value === false) {
    return fail('conflict', 'You cannot remove your own admin access.', 409);
  }
  const result = await setUserCapability({
    targetUserId: ctx.params.id, capability: body.capability, value: body.value, actorUserId: admin.id,
  });
  return ok(result);
});
