import { prisma } from '@/lib/db/client';
import { verifyPassword, hashIp } from '@/lib/auth/crypto';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validation/auth';
import { handle, clientIp } from '@/lib/http/route';
import { rateLimit } from '@/lib/http/rate-limit';
import { writeAudit } from '@/lib/audit/audit';
import { ok, fail } from '@/lib/http/responses';

export const POST = handle(async (req) => {
  const ip = clientIp(req);
  // Rate-limit by IP to blunt credential stuffing (§22, §32).
  const rl = rateLimit(`login:${hashIp(ip) ?? 'anon'}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return fail('rate_limited', 'Too many attempts. Try again shortly.', 429);

  const body = loginSchema.parse(await req.json());
  const user = await prisma.user.findUnique({ where: { email: body.email } });

  // Uniform failure + always run a real scrypt verify (against a valid dummy hash
  // when the user is absent) to reduce user-enumeration timing signal (§33).
  const DUMMY_HASH =
    'scrypt$32768$8$1$00000000000000000000000000000000$' +
    '0000000000000000000000000000000000000000000000000000000000000000';
  const okPass = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, body.password);

  if (!user || !okPass || user.status === 'SUSPENDED' || user.status === 'CLOSED') {
    await writeAudit({
      actorUserId: user?.id ?? null,
      action: 'auth.login_failed',
      entityType: 'user',
      entityId: user?.id ?? null,
      ipHash: hashIp(ip),
    });
    return fail('unauthenticated', 'Invalid email or password.', 401);
  }

  const session = await createSession({ userId: user.id, ip });
  setSessionCookie(session.token, session.expiresAt);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await writeAudit({
    actorUserId: user.id,
    action: 'auth.login',
    entityType: 'user',
    entityId: user.id,
    ipHash: hashIp(ip),
  });

  return ok({ id: user.id, email: user.email, displayName: user.displayName });
});
