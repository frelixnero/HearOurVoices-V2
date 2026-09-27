// Evidence service (spec §14). Enforces the platform's hardest guarantees:
//  - original and redacted copies are stored in separate buckets (§14.4)
//  - every important action appends to the chain of custody (§14.5) — never edited
//  - redaction never mutates the original or its hash (§14.6)
//  - access resolves through the server-side visibility policy; the original is
//    only ever handed to legal/admin with MFA (§14.7, §32)
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db/client';
import { storage } from '@/lib/storage';
import { canViewContent, evidenceCopyFor, type Viewer, type Visibility } from '@/lib/permissions/visibility';
import { writeAudit } from '@/lib/audit/audit';
import { scanBytes } from './scan';

export type ChainEventType =
  | 'uploaded' | 'accessed' | 'downloaded' | 'duplicated' | 'redacted'
  | 'transcribed' | 'converted' | 'linked_to_claim' | 'reviewed'
  | 'published' | 'restricted' | 'removed' | 'legal_hold';

/** Append an immutable chain-of-custody event (§14.5). Insert-only. */
export async function recordChainEvent(
  evidenceId: string,
  eventType: ChainEventType,
  actorUserId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await prisma.evidenceChainEvent.create({
    data: { evidenceId, eventType, actorUserId, metadataJson: metadata as never },
  });
}

export interface CreateEvidenceInput {
  uploaderUserId: string;
  title: string;
  description?: string;
  evidenceType: string;
  bytes: Buffer;
  mimeType: string;
  originalFilename: string;
  visibility?: Visibility;
}

/** Store an uploaded original (restricted) and open the chain of custody. */
export async function createEvidence(input: CreateEvidenceInput) {
  // Malware/safety scan before the bytes are ever stored (§31 pipeline).
  const scan = await scanBytes(input.bytes, input.originalFilename);
  if (!scan.clean) {
    throw new Error(`Upload rejected: ${scan.reason ?? 'failed safety scan'}`);
  }
  const keyPrefix = randomUUID();
  const originalKey = `${keyPrefix}/original`;
  const stored = await storage().put('originals', originalKey, input.bytes);

  const evidence = await prisma.evidenceItem.create({
    data: {
      uploaderUserId: input.uploaderUserId,
      title: input.title,
      description: input.description ?? null,
      evidenceType: input.evidenceType,
      originalStorageKey: originalKey,
      originalHash: stored.hash,
      // OWNER_ONLY until a reviewer redacts + publishes (§14, §25.2).
      visibility: input.visibility ?? 'OWNER_ONLY',
      verificationStatus: 'unverified',
      redactionStatus: 'NONE',
      metadata: {
        create: {
          originalFilename: input.originalFilename,
          mimeType: input.mimeType,
          fileSize: stored.size,
        },
      },
    },
  });

  await recordChainEvent(evidence.id, 'uploaded', input.uploaderUserId, {
    hash: stored.hash,
    size: stored.size,
  });
  await writeAudit({
    actorUserId: input.uploaderUserId,
    action: 'evidence.uploaded',
    entityType: 'evidence',
    entityId: evidence.id,
    after: { hash: stored.hash },
  });
  return evidence;
}

export interface RedactInput {
  evidenceId: string;
  redactorUserId: string;
  redactedBytes: Buffer;
  reason: string;
  approvedBy?: string;
  makePublic?: boolean;
}

/**
 * Create a redacted public copy WITHOUT touching the original (§14.4, §14.6).
 * Returns the updated evidence. Optionally flips visibility to PUBLIC.
 */
export async function redactEvidence(input: RedactInput) {
  const before = await prisma.evidenceItem.findUniqueOrThrow({
    where: { id: input.evidenceId },
  });
  if (before.legalHold) {
    throw new Error('Evidence is under legal hold and cannot be modified.');
  }

  const publicKey = `${before.id}/redacted-${Date.now()}`;
  const stored = await storage().put('public', publicKey, input.redactedBytes);

  const updated = await prisma.evidenceItem.update({
    where: { id: input.evidenceId },
    data: {
      publicStorageKey: publicKey,
      processedHash: stored.hash,
      redactionStatus: input.approvedBy ? 'APPROVED' : 'REDACTED',
      ...(input.makePublic ? { visibility: 'PUBLIC' } : {}),
      redactions: {
        create: {
          redactedCopyKey: publicKey,
          reason: input.reason,
          redactedBy: input.redactorUserId,
          approvedBy: input.approvedBy ?? null,
        },
      },
    },
  });

  // Invariant: original is untouched.
  if (updated.originalStorageKey !== before.originalStorageKey ||
      updated.originalHash !== before.originalHash) {
    throw new Error('Invariant violated: redaction altered the original.');
  }

  await recordChainEvent(input.evidenceId, 'redacted', input.redactorUserId, {
    reason: input.reason,
    redactedHash: stored.hash,
  });
  if (input.makePublic) {
    await recordChainEvent(input.evidenceId, 'published', input.redactorUserId, {});
  }
  await writeAudit({
    actorUserId: input.redactorUserId,
    action: 'evidence.redacted',
    entityType: 'evidence',
    entityId: input.evidenceId,
    before: { redactionStatus: before.redactionStatus },
    after: { redactionStatus: updated.redactionStatus },
  });
  return updated;
}

export interface AccessResult {
  copy: 'original' | 'public' | 'none';
  url?: string;
}

/**
 * Resolve which copy a viewer may download and return a signed URL. Records an
 * 'accessed' chain event for any successful access (§14.5). Returns copy:'none'
 * (no URL) when access is denied.
 */
export async function resolveEvidenceAccess(
  evidenceId: string,
  viewer: Viewer | null,
  ttlSeconds = 300,
): Promise<AccessResult> {
  const ev = await prisma.evidenceItem.findUniqueOrThrow({ where: { id: evidenceId } });
  const ctx = { visibility: ev.visibility as Visibility, viewer, ownerUserId: ev.uploaderUserId };
  const copy = evidenceCopyFor(ctx);

  if (copy === 'none') return { copy };
  if (copy === 'original' && !ev.originalStorageKey) return { copy: 'none' };
  if (copy === 'public' && !ev.publicStorageKey) {
    // No redacted copy exists yet — non-privileged viewers get nothing.
    return { copy: 'none' };
  }

  const bucket = copy === 'original' ? 'originals' : 'public';
  const key = copy === 'original' ? ev.originalStorageKey : ev.publicStorageKey!;
  const url = await storage().getSignedDownloadUrl(bucket, key, ttlSeconds);

  await recordChainEvent(evidenceId, 'accessed', viewer?.userId ?? null, { copy });
  return { copy, url };
}

/** Convenience used by canView checks elsewhere. */
export function evidenceViewable(visibility: Visibility, viewer: Viewer | null, ownerUserId?: string) {
  return canViewContent({ visibility, viewer, ownerUserId });
}
