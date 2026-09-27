// Server-side session management backed by the DB `sessions` table (spec §28.1).
// Sessions are revocable (§32 session revocation). The cookie holds only the raw
// token; the DB holds its hash.
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/client';
import type { RoleName } from '@/lib/permissions/roles';
import { createSessionToken, sha256, hashIp } from './crypto';

export const SESSION_COOKIE = 'hov_session';

function ttlHours(): number {
  const raw = Number(process.env.SESSION_TTL_HOURS ?? '72');
  return Number.isFinite(raw) && raw > 0 ? raw : 72;
}

export async function createSession(opts: {
  userId: string;
  ip?: string | null;
  deviceId?: string | null;
}): Promise<{ token: string; expiresAt: Date }> {
  const { token, tokenHash } = createSessionToken();
  const expiresAt = new Date(Date.now() + ttlHours() * 3600 * 1000);
  await prisma.session.create({
    data: {
      userId: opts.userId,
      tokenHash,
      ipHash: hashIp(opts.ip),
      deviceId: opts.deviceId ?? null,
      expiresAt,
    },
  });
  return { token, expiresAt };
}

export function setSessionCookie(token: string, expiresAt: Date): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  status: string;
  mfaEnabled: boolean;
  roles: RoleName[];
}

/** Resolve the current user from the session cookie, or null. Server-only. */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: { include: { roles: { include: { role: true } } } },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  const u = session.user;
  if (u.status === 'SUSPENDED' || u.status === 'CLOSED') return null;

  const roles = u.roles
    .filter((r) => !r.revokedAt)
    .map((r) => r.role.name as RoleName);

  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    status: u.status,
    // MFA counts as enabled only once a code has confirmed it (a "pending:"
    // secret from setup does not grant MFA-gated access).
    mfaEnabled: Boolean(u.mfaSecret) && !u.mfaSecret!.startsWith('pending:'),
    roles,
  };
}

export async function revokeSession(token: string): Promise<void> {
  await prisma.session.updateMany({
    where: { tokenHash: sha256(token) },
    data: { revokedAt: new Date() },
  });
}

export async function revokeCurrentSession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  cookies().delete(SESSION_COOKIE);
}
