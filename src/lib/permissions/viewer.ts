// Maps the authenticated session user into a Viewer for visibility checks.
import { getCurrentUser } from '@/lib/auth/session';
import type { Viewer } from './visibility';

export async function currentViewer(): Promise<Viewer | null> {
  const u = await getCurrentUser();
  return u ? { userId: u.id, roles: u.roles, mfaEnabled: u.mfaEnabled } : null;
}
