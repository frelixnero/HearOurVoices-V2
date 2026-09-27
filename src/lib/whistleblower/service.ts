// Whistleblower service. Submissions store NO identity/IP — only the encrypted
// message. Staff read decrypted tips to act on them (moderated).
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { encrypt, decrypt } from './crypto';

export const TIP_CATEGORIES = ['Government / agency', 'Police', 'Schools', 'Courts', 'Workplace', 'Other'] as const;

/** Store an encrypted tip. Deliberately takes only the message + category —
 *  no request, no headers, no IP ever reach this function. */
export async function submitTip(message: string, category?: string) {
  const ciphertext = encrypt(message);
  const tip = await prisma.whistleblowerTip.create({ data: { ciphertext, category: category ?? null, status: 'NEW' } });
  return { id: tip.id };
}

/** Staff-only: list tips with the message decrypted for review. */
export async function listTips(status: 'NEW' | 'REVIEWED' | 'ARCHIVED' = 'NEW', take = 50) {
  const rows = await prisma.whistleblowerTip.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, take: Math.min(take, 100) });
  return rows.map((r) => {
    let message = '';
    try { message = decrypt(r.ciphertext); } catch { message = '[unable to decrypt — key may have changed]'; }
    return { id: r.id, category: r.category, status: r.status, createdAt: r.createdAt, message };
  });
}

export async function setTipStatus(id: string, status: 'NEW' | 'REVIEWED' | 'ARCHIVED', actorUserId: string) {
  const tip = await prisma.whistleblowerTip.update({ where: { id }, data: { status } });
  // Audit records only the tip id + new status — never the content.
  await writeAudit({ actorUserId, action: `whistleblower.${status.toLowerCase()}`, entityType: 'whistleblower_tip', entityId: id });
  return tip;
}

export async function countNewTips() {
  return prisma.whistleblowerTip.count({ where: { status: 'NEW' } });
}
