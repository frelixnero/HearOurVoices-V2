import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { createEvidence, redactEvidence, resolveEvidenceAccess } from '@/lib/evidence/service';
import { makeUser, viewerOf } from './setup/factory';

describe('Evidence service (spec §14) — integration', () => {
  it('stores an original, opens the chain of custody, and starts OWNER_ONLY', async () => {
    const uploader = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const ev = await createEvidence({
      uploaderUserId: uploader.id,
      title: 'Fictional contract PDF',
      evidenceType: 'pdf',
      bytes: Buffer.from('ORIGINAL-CONTENT-with-SSN-123-45-6789'),
      mimeType: 'application/pdf',
      originalFilename: 'contract.pdf',
    });
    expect(ev.visibility).toBe('OWNER_ONLY');
    expect(ev.originalHash).toMatch(/^[a-f0-9]{64}$/);
    const chain = await prisma.evidenceChainEvent.findMany({ where: { evidenceId: ev.id } });
    expect(chain.map((c) => c.eventType)).toContain('uploaded');
  });

  it('redaction creates a distinct public copy and never mutates the original', async () => {
    const uploader = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const mod = await makeUser({ roles: ['MODERATOR'], mfa: true });
    const ev = await createEvidence({
      uploaderUserId: uploader.id,
      title: 'doc', evidenceType: 'pdf',
      bytes: Buffer.from('ORIGINAL with 123-45-6789'),
      mimeType: 'application/pdf', originalFilename: 'd.pdf',
    });
    const originalHashBefore = ev.originalHash;

    const redacted = await redactEvidence({
      evidenceId: ev.id,
      redactorUserId: mod.id,
      redactedBytes: Buffer.from('REDACTED with [removed]'),
      reason: 'Removed SSN (§14.6)',
      makePublic: true,
    });

    expect(redacted.originalHash).toBe(originalHashBefore); // original untouched
    expect(redacted.publicStorageKey).toBeTruthy();
    expect(redacted.processedHash).not.toBe(originalHashBefore); // distinct copy
    expect(redacted.visibility).toBe('PUBLIC');
    const chain = await prisma.evidenceChainEvent.findMany({ where: { evidenceId: ev.id } });
    expect(chain.map((c) => c.eventType)).toEqual(
      expect.arrayContaining(['uploaded', 'redacted', 'published']),
    );
  });

  it('a public viewer of published evidence gets the redacted copy, never the original', async () => {
    const uploader = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const mod = await makeUser({ roles: ['MODERATOR'], mfa: true });
    const ev = await createEvidence({
      uploaderUserId: uploader.id, title: 'x', evidenceType: 'image',
      bytes: Buffer.from('orig'), mimeType: 'image/png', originalFilename: 'x.png',
    });
    await redactEvidence({
      evidenceId: ev.id, redactorUserId: mod.id,
      redactedBytes: Buffer.from('pub'), reason: 'r', makePublic: true,
    });

    const anon = await resolveEvidenceAccess(ev.id, null);
    expect(anon.copy).toBe('public');
    expect(anon.url).toContain('bucket=public');
  });

  it('restricted (OWNER_ONLY) original is not downloadable by an unrelated citizen', async () => {
    const uploader = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const other = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const ev = await createEvidence({
      uploaderUserId: uploader.id, title: 'secret', evidenceType: 'pdf',
      bytes: Buffer.from('secret'), mimeType: 'application/pdf', originalFilename: 's.pdf',
    });
    const access = await resolveEvidenceAccess(ev.id, viewerOf(other, ['VERIFIED_CITIZEN']));
    expect(access.copy).toBe('none');
    expect(access.url).toBeUndefined();
  });

  it('a legal reviewer WITH MFA can retrieve the original of legal-only evidence', async () => {
    const uploader = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const legal = await makeUser({ roles: ['LEGAL_REVIEWER'], mfa: true });
    const ev = await createEvidence({
      uploaderUserId: uploader.id, title: 'sealed-ish', evidenceType: 'pdf',
      bytes: Buffer.from('orig'), mimeType: 'application/pdf', originalFilename: 's.pdf',
      visibility: 'LEGAL_REVIEW_ONLY',
    });
    const access = await resolveEvidenceAccess(ev.id, viewerOf(legal, ['LEGAL_REVIEWER']));
    expect(access.copy).toBe('original');
    expect(access.url).toContain('bucket=originals');
  });
});
