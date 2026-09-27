import { prisma } from '@/lib/db/client';
import { handle, clientIp } from '@/lib/http/route';
import { getCurrentUser, createSession, setSessionCookie } from '@/lib/auth/session';
import { verifyPassword, hashPassword, hashIp } from '@/lib/auth/crypto';
import { checkPasswordStrength } from '@/lib/auth/password-policy';
import { changePasswordSchema } from '@/lib/validation/auth';
import { writeAudit } from '@/lib/audit/audit';
import { ok, fail, ApiError } from '@/lib/http/responses';

// Change the signed-in user's password. Verifies the current password, enforces
// the password policy, then rotates sessions: every OTHER device is logged out and
// this device gets a fresh session (best practice after a credential change).
export const POST = handle(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Please sign in.', 401);

  const body = changePasswordSchema.parse(await req.json());
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  if (!record.passwordHash || !(await verifyPassword(record.passwordHash, body.currentPassword))) {
    return fail('unauthenticated', 'Your current password is not correct.', 401);
  }
  const strength = checkPasswordStrength(body.newPassword);
  if (!strength.ok) throw new ApiError('validation_error', 'Weak password.', strength.errors);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(body.newPassword) },
  });

  // Revoke all existing sessions (logs out every device)...
  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  // ...then issue a fresh session so THIS device stays signed in.
  const ip = clientIp(req);
  const session = await createSession({ userId: user.id, ip });
  setSessionCookie(session.token, session.expiresAt);

  await writeAudit({ actorUserId: user.id, action: 'auth.password_changed', entityType: 'user', entityId: user.id, ipHash: hashIp(ip) });
  return ok({ changed: true, message: 'Password changed. Other devices have been signed out.' });
});
