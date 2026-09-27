import { describe, it, expect } from 'vitest';
import { canViewContent, evidenceCopyFor, type Viewer } from '@/lib/permissions/visibility';

const anon = null;
const citizen: Viewer = { userId: 'u1', roles: ['VERIFIED_CITIZEN'], mfaEnabled: false };
const researcher: Viewer = { userId: 'u2', roles: ['COMMUNITY_RESEARCHER'], mfaEnabled: false };
const moderator: Viewer = { userId: 'u3', roles: ['MODERATOR'], mfaEnabled: true };
const legal: Viewer = { userId: 'u4', roles: ['LEGAL_REVIEWER'], mfaEnabled: true };
const legalNoMfa: Viewer = { userId: 'u5', roles: ['LEGAL_REVIEWER'], mfaEnabled: false };
const admin: Viewer = { userId: 'u6', roles: ['ADMINISTRATOR'], mfaEnabled: true };

describe('Content visibility policy (spec §14.7, §32)', () => {
  it('PUBLIC is visible to everyone including anonymous', () => {
    expect(canViewContent({ visibility: 'PUBLIC', viewer: anon })).toBe(true);
    expect(canViewContent({ visibility: 'PUBLIC', viewer: citizen })).toBe(true);
  });

  it('anything above PUBLIC is hidden from anonymous visitors', () => {
    for (const v of ['REGISTERED', 'VERIFIED_RESEARCHERS', 'MODERATOR_ONLY', 'SEALED'] as const) {
      expect(canViewContent({ visibility: v, viewer: anon })).toBe(false);
    }
  });

  it('REGISTERED is visible to any authenticated user', () => {
    expect(canViewContent({ visibility: 'REGISTERED', viewer: citizen })).toBe(true);
  });

  it('VERIFIED_RESEARCHERS excludes plain citizens but includes researchers and the owner', () => {
    expect(canViewContent({ visibility: 'VERIFIED_RESEARCHERS', viewer: citizen })).toBe(false);
    expect(canViewContent({ visibility: 'VERIFIED_RESEARCHERS', viewer: researcher })).toBe(true);
    expect(
      canViewContent({ visibility: 'VERIFIED_RESEARCHERS', viewer: citizen, ownerUserId: 'u1' }),
    ).toBe(true);
  });

  it('MODERATOR_ONLY excludes researchers, includes moderators', () => {
    expect(canViewContent({ visibility: 'MODERATOR_ONLY', viewer: researcher })).toBe(false);
    expect(canViewContent({ visibility: 'MODERATOR_ONLY', viewer: moderator })).toBe(true);
  });

  it('LEGAL_REVIEW_ONLY excludes moderators, includes legal + admin', () => {
    expect(canViewContent({ visibility: 'LEGAL_REVIEW_ONLY', viewer: moderator })).toBe(false);
    expect(canViewContent({ visibility: 'LEGAL_REVIEW_ONLY', viewer: legal })).toBe(true);
    expect(canViewContent({ visibility: 'LEGAL_REVIEW_ONLY', viewer: admin })).toBe(true);
  });

  it('OWNER_ONLY is visible to the owner or an admin, nobody else', () => {
    expect(canViewContent({ visibility: 'OWNER_ONLY', viewer: citizen, ownerUserId: 'u1' })).toBe(true);
    expect(canViewContent({ visibility: 'OWNER_ONLY', viewer: researcher, ownerUserId: 'u1' })).toBe(false);
    expect(canViewContent({ visibility: 'OWNER_ONLY', viewer: admin, ownerUserId: 'u1' })).toBe(true);
  });

  it('SEALED requires legal/admin AND MFA — even legal without MFA is denied', () => {
    expect(canViewContent({ visibility: 'SEALED', viewer: legal })).toBe(true);
    expect(canViewContent({ visibility: 'SEALED', viewer: legalNoMfa })).toBe(false);
    expect(canViewContent({ visibility: 'SEALED', viewer: moderator })).toBe(false);
    // Even the owner cannot bypass a seal.
    expect(canViewContent({ visibility: 'SEALED', viewer: citizen, ownerUserId: 'u1' })).toBe(false);
  });
});

describe('Evidence copy selection (spec §14.4 — original never served publicly)', () => {
  it('a public viewer of PUBLIC evidence only ever gets the redacted public copy', () => {
    expect(evidenceCopyFor({ visibility: 'PUBLIC', viewer: anon })).toBe('public');
    expect(evidenceCopyFor({ visibility: 'PUBLIC', viewer: citizen })).toBe('public');
  });

  it('a legal reviewer with MFA can receive the original', () => {
    expect(evidenceCopyFor({ visibility: 'LEGAL_REVIEW_ONLY', viewer: legal })).toBe('original');
  });

  it('a legal reviewer WITHOUT MFA never receives the original (gets redacted copy)', () => {
    const copy = evidenceCopyFor({ visibility: 'LEGAL_REVIEW_ONLY', viewer: legalNoMfa });
    expect(copy).not.toBe('original');
    expect(copy).toBe('public');
  });

  it('a citizen viewing restricted evidence gets nothing (not the original)', () => {
    expect(evidenceCopyFor({ visibility: 'MODERATOR_ONLY', viewer: citizen })).toBe('none');
  });
});
