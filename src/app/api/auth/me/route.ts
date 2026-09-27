import { getCurrentUser } from '@/lib/auth/session';
import { handle } from '@/lib/http/route';
import { ok } from '@/lib/http/responses';
import { permissionsForRoles } from '@/lib/permissions/roles';

// Returns the current user + effective permissions so the client can render the
// correct UI. Enforcement still happens server-side on every action.
export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return ok({ authenticated: false });
  return ok({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      mfaEnabled: user.mfaEnabled,
    },
    permissions: [...permissionsForRoles(user.roles)],
  });
});
