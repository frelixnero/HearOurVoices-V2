import { describe, it, expect } from 'vitest';
import {
  permissionsForRoles,
  roleSetHasPermission,
  ROLE_PERMISSIONS,
  PERMISSIONS,
  decide,
} from '@/lib/permissions/roles';

describe('RBAC permission matrix (spec §29, §45 rules 6-7)', () => {
  it('unauthenticated users may only view public content', () => {
    expect(decide(null, 'content.view_public')).toEqual({ allowed: true });
    expect(decide(null, 'claim.submit')).toEqual({
      allowed: false,
      reason: 'unauthenticated',
    });
  });

  it('a registered citizen cannot submit claims or upload evidence', () => {
    const roles = ['REGISTERED_CITIZEN'] as const;
    expect(roleSetHasPermission(roles, 'claim.draft')).toBe(true);
    expect(roleSetHasPermission(roles, 'claim.submit')).toBe(false);
    expect(roleSetHasPermission(roles, 'evidence.upload')).toBe(false);
  });

  it('a verified citizen can submit claims and upload evidence', () => {
    const roles = ['VERIFIED_CITIZEN'] as const;
    expect(roleSetHasPermission(roles, 'claim.submit')).toBe(true);
    expect(roleSetHasPermission(roles, 'evidence.upload')).toBe(true);
  });

  it('a verified citizen cannot publish claims or moderate', () => {
    const roles = ['VERIFIED_CITIZEN'] as const;
    expect(roleSetHasPermission(roles, 'claim.publish')).toBe(false);
    expect(roleSetHasPermission(roles, 'moderation.act')).toBe(false);
    expect(roleSetHasPermission(roles, 'admin.view_audit_log')).toBe(false);
  });

  it('a moderator cannot access legal holds or finance', () => {
    const roles = ['MODERATOR'] as const;
    expect(roleSetHasPermission(roles, 'moderation.act')).toBe(true);
    expect(roleSetHasPermission(roles, 'legal.apply_hold')).toBe(false);
    expect(roleSetHasPermission(roles, 'finance.approve_disbursement')).toBe(false);
  });

  it('an administrator holds every permission', () => {
    const set = permissionsForRoles(['ADMINISTRATOR']);
    for (const p of PERMISSIONS) expect(set.has(p)).toBe(true);
  });

  it('effective permissions are the union of multiple roles', () => {
    const set = permissionsForRoles(['VERIFIED_CITIZEN', 'MODERATOR']);
    expect(set.has('claim.submit')).toBe(true); // from verified citizen
    expect(set.has('moderation.act')).toBe(true); // from moderator
  });

  it('every role grants at least public read', () => {
    for (const role of Object.keys(ROLE_PERMISSIONS)) {
      expect(permissionsForRoles([role as never]).has('content.view_public')).toBe(true);
    }
  });
});

describe('MFA-gated permissions (spec §29, §32)', () => {
  it('privileged actions are denied without MFA even with the right role', () => {
    const moderatorNoMfa = { roles: ['MODERATOR'] as const, mfaEnabled: false };
    expect(decide(moderatorNoMfa, 'moderation.act')).toEqual({
      allowed: false,
      reason: 'mfa_required',
    });
  });

  it('the same action is allowed once MFA is enabled', () => {
    const moderatorMfa = { roles: ['MODERATOR'] as const, mfaEnabled: true };
    expect(decide(moderatorMfa, 'moderation.act')).toEqual({ allowed: true });
  });

  it('non-sensitive actions do not require MFA', () => {
    const verifiedNoMfa = { roles: ['VERIFIED_CITIZEN'] as const, mfaEnabled: false };
    expect(decide(verifiedNoMfa, 'claim.submit')).toEqual({ allowed: true });
  });
});
