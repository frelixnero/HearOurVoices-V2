// Server-side authorization guard (spec §45 coding rules 5-7). Every privileged
// API route calls requirePermission(). Denials are recorded to the audit log so
// abuse and probing are visible (§4.6). MFA-gated permissions are enforced here.
import { decide, type Permission } from './roles';
import { getCurrentUser, type AuthenticatedUser } from '@/lib/auth/session';
import { writeAudit } from '@/lib/audit/audit';
import { ApiError } from '@/lib/http/responses';

// Re-export the pure decision fn so existing imports keep working.
export { decide } from './roles';

/**
 * Resolve the current user and assert they hold `permission`. Throws ApiError on
 * denial (caught by the route wrapper). Returns the authenticated user on success.
 */
export async function requirePermission(
  permission: Permission,
  ctx?: { entityType?: string; entityId?: string; ipHash?: string | null },
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  const result = decide(user, permission);

  if (!result.allowed) {
    // Log denied privileged attempts (not plain unauthenticated public reads).
    if (result.reason !== 'unauthenticated' || user) {
      await writeAudit({
        actorUserId: user?.id ?? null,
        action: `authz.denied:${permission}`,
        entityType: ctx?.entityType ?? 'authz',
        entityId: ctx?.entityId ?? null,
        after: { reason: result.reason },
        ipHash: ctx?.ipHash ?? null,
      });
    }
    const message =
      result.reason === 'unauthenticated'
        ? 'You must sign in to do this.'
        : result.reason === 'mfa_required'
          ? 'This action requires multi-factor authentication.'
          : 'You do not have permission to do this.';
    throw new ApiError(result.reason, message);
  }

  // Non-null: decide() only returns allowed for a real user (except public read,
  // which returns a user when present). Guarantee a user for privileged perms.
  if (!user) throw new ApiError('unauthenticated', 'You must sign in to do this.');
  return user;
}
