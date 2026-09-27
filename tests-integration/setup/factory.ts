// Test factories — create users with roles, jurisdictions, etc. against the live
// test DB. Each uses unique ids so tests don't collide within the shared database.
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db/client';
import type { RoleName } from '@/lib/permissions/roles';
import type { Viewer } from '@/lib/permissions/visibility';

export async function makeUser(opts: { roles?: RoleName[]; mfa?: boolean } = {}) {
  const id = randomUUID();
  const user = await prisma.user.create({
    data: {
      email: `u_${id}@test.local`,
      displayName: `User ${id.slice(0, 6)}`,
      status: 'ACTIVE',
      mfaSecret: opts.mfa ? 'test-totp-secret' : null,
    },
  });
  for (const roleName of opts.roles ?? []) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }
  return user;
}

/** Build a Viewer object (as the session layer would) for visibility checks. */
export function viewerOf(
  user: { id: string; mfaSecret?: string | null },
  roles: RoleName[],
): Viewer {
  return { userId: user.id, roles, mfaEnabled: Boolean(user.mfaSecret) };
}

export async function makeJurisdiction() {
  return prisma.jurisdiction.create({
    data: { name: `Testville ${randomUUID().slice(0, 6)}`, type: 'city', stateCode: 'ZZ' },
  });
}
