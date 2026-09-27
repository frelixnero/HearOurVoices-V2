// Verification service: starts a KYC session and, on approval, promotes a
// Registered Citizen to Verified Citizen (grants the role, activates the account).
import { prisma } from '@/lib/db/client';
import { identityProvider } from './provider';
import { writeAudit } from '@/lib/audit/audit';

export async function startVerification(userId: string) {
  const provider = identityProvider();
  const started = await provider.start(userId);
  const record = await prisma.identityVerification.create({
    data: {
      userId,
      verificationType: 'residency',
      provider: 'mock',
      status: 'STARTED',
      encryptedReference: started.reference, // encrypt at rest in prod (§32)
    },
  });
  return { verificationId: record.id, redirectUrl: started.redirectUrl };
}

export async function completeVerification(userId: string, verificationId: string) {
  const record = await prisma.identityVerification.findFirstOrThrow({
    where: { id: verificationId, userId },
  });
  const result = await identityProvider().check(record.encryptedReference ?? '');

  if (result.status !== 'approved') {
    await prisma.identityVerification.update({
      where: { id: record.id },
      data: { status: result.status === 'rejected' ? 'REJECTED' : 'PENDING_REVIEW' },
    });
    return { verified: false, status: result.status };
  }

  // Approved: mark verification, activate account, grant Verified Citizen role.
  await prisma.identityVerification.update({
    where: { id: record.id },
    data: {
      status: 'APPROVED',
      verifiedName: result.verifiedName ?? null,
      verifiedJurisdiction: result.verifiedJurisdiction ?? null,
      completedAt: new Date(),
    },
  });
  await prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });

  const role = await prisma.role.findUnique({ where: { name: 'VERIFIED_CITIZEN' } });
  if (role) {
    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId: role.id, scopeType: 'GLOBAL', revokedAt: null },
    });
    if (!existing) await prisma.userRole.create({ data: { userId, roleId: role.id } });
  }
  await writeAudit({ actorUserId: userId, action: 'identity.verified', entityType: 'user', entityId: userId });
  return { verified: true, status: 'approved' as const };
}
