// Admin / moderator authorization for the story platform. Simple, DB-backed
// staff flags (isModerator / isAdmin) resolved from the current session. All
// admin routes go through requireModerator() or requireAdmin() — never trust the
// client.
import { prisma } from '@/lib/db/client';
import { getCurrentUser } from './session';
import { ApiError } from '@/lib/http/responses';

export interface StaffUser {
  id: string;
  email: string;
  displayName: string;
  isModerator: boolean;
  isAdmin: boolean;
  isJournalist: boolean;
}

export async function getStaffUser(): Promise<StaffUser | null> {
  const u = await getCurrentUser();
  if (!u) return null;
  const row = await prisma.user.findUnique({
    where: { id: u.id },
    select: { isModerator: true, isAdmin: true, isJournalist: true },
  });
  if (!row) return null;
  return {
    id: u.id, email: u.email, displayName: u.displayName,
    isModerator: row.isModerator, isAdmin: row.isAdmin, isJournalist: row.isJournalist,
  };
}

/** Moderator OR admin. Throws 401 if signed out, 403 if not staff. */
export async function requireModerator(): Promise<StaffUser> {
  const s = await getStaffUser();
  if (!s) throw new ApiError('unauthenticated', 'Please sign in.');
  if (!s.isModerator && !s.isAdmin) throw new ApiError('permission_denied', 'Moderator access required.');
  return s;
}

/** Admin only. */
export async function requireAdmin(): Promise<StaffUser> {
  const s = await getStaffUser();
  if (!s) throw new ApiError('unauthenticated', 'Please sign in.');
  if (!s.isAdmin) throw new ApiError('permission_denied', 'Admin access required.');
  return s;
}
