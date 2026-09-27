// Independent Civic Journalist qualification. Contributors earn the higher-trust
// lane after a good record — they don't self-declare. Applying checks the track
// record and grants the flag if eligible.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { contributorRecord } from './record';

export async function applyForJournalist(userId: string) {
  const record = await contributorRecord(userId);
  if (!record.eligibleForJournalist) {
    return { granted: false, record };
  }
  await prisma.user.update({ where: { id: userId }, data: { isJournalist: true } });
  await writeAudit({ actorUserId: userId, action: 'journalist.qualified', entityType: 'user', entityId: userId });
  return { granted: true, record };
}

export async function isJournalist(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { isJournalist: true } });
  return Boolean(u?.isJournalist);
}
