// Server-side content-visibility policy (spec §14.7 visibility levels, §32 data
// separation). This replaces the MVP's 3-level client-side `evidenceAccess` stub
// with the full 8-tier model, enforced on the server. Used to gate evidence,
// claims, and any record carrying a ContentVisibility.
import type { RoleName } from './roles';

// Mirrors the Prisma `ContentVisibility` enum (§14.7).
export type Visibility =
  | 'PUBLIC'
  | 'REGISTERED'
  | 'VERIFIED_RESEARCHERS'
  | 'INVESTIGATION_TEAM'
  | 'MODERATOR_ONLY'
  | 'LEGAL_REVIEW_ONLY'
  | 'OWNER_ONLY'
  | 'SEALED';

export interface Viewer {
  userId: string;
  roles: readonly RoleName[];
  mfaEnabled: boolean;
}

export interface ViewContext {
  visibility: Visibility;
  viewer: Viewer | null; // null = anonymous visitor
  ownerUserId?: string | null;
  /** For INVESTIGATION_TEAM: is the viewer a member of the owning investigation? */
  isInvestigationMember?: boolean;
}

function hasAny(roles: readonly RoleName[], allowed: RoleName[]): boolean {
  return roles.some((r) => allowed.includes(r));
}

const RESEARCH_ROLES: RoleName[] = [
  'COMMUNITY_RESEARCHER',
  'JOURNALIST_RESEARCHER',
  'MODERATOR',
  'LEGAL_REVIEWER',
  'ADMINISTRATOR',
];
const MOD_ROLES: RoleName[] = ['MODERATOR', 'LEGAL_REVIEWER', 'ADMINISTRATOR'];
const LEGAL_ROLES: RoleName[] = ['LEGAL_REVIEWER', 'ADMINISTRATOR'];

/**
 * Can this viewer see content at the given visibility? Pure + testable.
 * SEALED is the most restricted tier: legal/admin only AND MFA (§32 high-risk).
 * Administrators can view all tiers (except SEALED still requires their MFA).
 */
export function canViewContent(ctx: ViewContext): boolean {
  const { visibility, viewer } = ctx;

  if (visibility === 'PUBLIC') return true;
  if (!viewer) return false; // everything below requires a signed-in user

  const isOwner = Boolean(ctx.ownerUserId && ctx.ownerUserId === viewer.userId);
  const isAdmin = viewer.roles.includes('ADMINISTRATOR');

  switch (visibility) {
    case 'REGISTERED':
      return true; // any authenticated user
    case 'VERIFIED_RESEARCHERS':
      return isOwner || hasAny(viewer.roles, RESEARCH_ROLES);
    case 'INVESTIGATION_TEAM':
      return isOwner || Boolean(ctx.isInvestigationMember) || hasAny(viewer.roles, MOD_ROLES);
    case 'MODERATOR_ONLY':
      return hasAny(viewer.roles, MOD_ROLES);
    case 'LEGAL_REVIEW_ONLY':
      return hasAny(viewer.roles, LEGAL_ROLES);
    case 'OWNER_ONLY':
      return isOwner || isAdmin;
    case 'SEALED':
      // Sealed originals: legal/admin AND MFA (§14.7, §32). No owner shortcut.
      return hasAny(viewer.roles, LEGAL_ROLES) && viewer.mfaEnabled;
    default: {
      // Exhaustiveness guard — a new visibility must be handled explicitly.
      const _never: never = visibility;
      return _never;
    }
  }
}

/**
 * Which stored copy of an evidence item may this viewer receive?
 *  - 'none'     — the viewer cannot see the item at all.
 *  - 'original' — only legal/admin WITH MFA may receive the unredacted original
 *                 (`evidence.access_restricted`, §14.4, §32).
 *  - 'public'   — everyone else who may view the item gets the redacted copy.
 * The original is therefore never served to non-privileged or non-MFA viewers.
 */
export function evidenceCopyFor(ctx: ViewContext): 'original' | 'public' | 'none' {
  if (!canViewContent(ctx)) return 'none';
  const viewer = ctx.viewer;
  const canOriginal =
    !!viewer &&
    (viewer.roles.includes('LEGAL_REVIEWER') || viewer.roles.includes('ADMINISTRATOR')) &&
    viewer.mfaEnabled;
  return canOriginal ? 'original' : 'public';
}
