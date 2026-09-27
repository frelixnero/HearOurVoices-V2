// Role & permission model (spec §6 user types, §29 permission model).
// This is the single source of truth for authorization. Client code may READ
// these to hide UI, but every enforcement decision happens on the server
// (spec §45 coding rules 6 & 7 — never trust client-side role checks).

export const ROLES = [
  'VISITOR', // not authenticated (implicit)
  'REGISTERED_CITIZEN',
  'VERIFIED_CITIZEN',
  'CONFIDENTIAL_TIPSTER',
  'COMMUNITY_RESEARCHER',
  'JOURNALIST_RESEARCHER',
  'OFFICIAL_REPRESENTATIVE',
  'COURT_AGENCY_REPRESENTATIVE',
  'CAMPAIGN_ORGANIZER',
  'MODERATOR',
  'LEGAL_REVIEWER',
  'FINANCE_REVIEWER',
  'ADMINISTRATOR',
] as const;

export type RoleName = (typeof ROLES)[number];

// Permissions are verbs on resources. Keep them coarse enough to reason about,
// fine enough to enforce the spec's hard rules (§45 product rules).
export const PERMISSIONS = [
  // content consumption
  'content.view_public',
  // citizen participation
  'claim.draft',
  'claim.submit',
  'evidence.upload',
  'petition.sign',
  'records_request.create',
  'records_request.endorse',
  'correction.request',
  'follow.manage',
  // confidential intake
  'tip.submit_confidential',
  // research
  'timeline.edit_draft',
  'claim.link_evidence',
  'claim.propose_status',
  'investigation.participate',
  // official response
  'official.respond',
  'official.submit_correction',
  'official.upload_record',
  'scorecard.appeal',
  // moderation
  'moderation.view_queue',
  'moderation.act',
  'evidence.redact',
  'moderation.appeal_review',
  // legal
  'legal.review',
  'legal.apply_hold',
  'legal.restrict_publication',
  // finance (CivicFund)
  'finance.review_expenses',
  'finance.approve_disbursement',
  // evidence review / publication gate (human-in-loop, §25.2)
  'claim.publish',
  'evidence.review',
  'evidence.access_restricted',
  // administration
  'admin.manage_users',
  'admin.manage_roles',
  'admin.manage_jurisdictions',
  'admin.manage_methodologies',
  'admin.view_audit_log',
  'admin.manage_settings',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// Permissions that require MFA at time of use (spec §29 "sensitive permissions
// should require MFA", §32). Enforced by the server guard.
export const MFA_REQUIRED_PERMISSIONS: ReadonlySet<Permission> = new Set([
  'moderation.act',
  'evidence.redact',
  'legal.apply_hold',
  'legal.restrict_publication',
  'finance.approve_disbursement',
  'claim.publish',
  'evidence.access_restricted',
  'admin.manage_users',
  'admin.manage_roles',
  'admin.manage_jurisdictions',
  'admin.manage_methodologies',
  'admin.manage_settings',
]);

// Role → granted permissions. Additive: a user's effective set is the union of
// all their roles. VISITOR is the implicit floor for everyone.
const VISITOR: Permission[] = ['content.view_public'];

const REGISTERED_CITIZEN: Permission[] = [
  ...VISITOR,
  'claim.draft',
  'correction.request',
  'follow.manage',
];

const VERIFIED_CITIZEN: Permission[] = [
  ...REGISTERED_CITIZEN,
  'claim.submit',
  'evidence.upload',
  'petition.sign',
  'records_request.create',
  'records_request.endorse',
];

const CONFIDENTIAL_TIPSTER: Permission[] = [...VISITOR, 'tip.submit_confidential'];

const COMMUNITY_RESEARCHER: Permission[] = [
  ...VERIFIED_CITIZEN,
  'timeline.edit_draft',
  'claim.link_evidence',
  'claim.propose_status',
  'investigation.participate',
];

const JOURNALIST_RESEARCHER: Permission[] = [
  ...VERIFIED_CITIZEN,
  'investigation.participate',
];

const OFFICIAL_REPRESENTATIVE: Permission[] = [
  ...VISITOR,
  'official.respond',
  'official.submit_correction',
  'official.upload_record',
  'scorecard.appeal',
];

const COURT_AGENCY_REPRESENTATIVE: Permission[] = [...OFFICIAL_REPRESENTATIVE];

const CAMPAIGN_ORGANIZER: Permission[] = [...VERIFIED_CITIZEN];

const MODERATOR: Permission[] = [
  ...VISITOR,
  'moderation.view_queue',
  'moderation.act',
  'evidence.redact',
  'evidence.review',
];

const LEGAL_REVIEWER: Permission[] = [
  ...VISITOR,
  'legal.review',
  'legal.apply_hold',
  'legal.restrict_publication',
  'evidence.review',
  'evidence.access_restricted',
  'claim.publish',
];

const FINANCE_REVIEWER: Permission[] = [
  ...VISITOR,
  'finance.review_expenses',
  'finance.approve_disbursement',
];

// Administrator: full set. Kept explicit rather than a wildcard so the audit of
// "who can do what" is always readable (spec §4.6, §29).
const ADMINISTRATOR: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<RoleName, readonly Permission[]> = {
  VISITOR,
  REGISTERED_CITIZEN,
  VERIFIED_CITIZEN,
  CONFIDENTIAL_TIPSTER,
  COMMUNITY_RESEARCHER,
  JOURNALIST_RESEARCHER,
  OFFICIAL_REPRESENTATIVE,
  COURT_AGENCY_REPRESENTATIVE,
  CAMPAIGN_ORGANIZER,
  MODERATOR,
  LEGAL_REVIEWER,
  FINANCE_REVIEWER,
  ADMINISTRATOR,
};

/** Effective permission set for a set of roles (union). Everyone gets VISITOR. */
export function permissionsForRoles(roles: readonly RoleName[]): Set<Permission> {
  const set = new Set<Permission>(VISITOR);
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role] ?? []) set.add(perm);
  }
  return set;
}

/** Pure check used by both server guard and tests. */
export function roleSetHasPermission(
  roles: readonly RoleName[],
  permission: Permission,
): boolean {
  return permissionsForRoles(roles).has(permission);
}

export type DecisionSubject = { roles: readonly RoleName[]; mfaEnabled: boolean } | null;
export type Decision =
  | { allowed: true }
  | { allowed: false; reason: 'unauthenticated' | 'permission_denied' | 'mfa_required' };

/**
 * Pure authorization decision — no I/O, fully unit-testable. The server guard
 * (guard.ts) wraps this with session resolution and audit logging.
 */
export function decide(user: DecisionSubject, permission: Permission): Decision {
  if (!user) {
    if (permission === 'content.view_public') return { allowed: true };
    return { allowed: false, reason: 'unauthenticated' };
  }
  if (!roleSetHasPermission(user.roles, permission)) {
    return { allowed: false, reason: 'permission_denied' };
  }
  if (MFA_REQUIRED_PERMISSIONS.has(permission) && !user.mfaEnabled) {
    return { allowed: false, reason: 'mfa_required' };
  }
  return { allowed: true };
}
