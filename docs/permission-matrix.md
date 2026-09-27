# HearOURVOICES — Role & Permission Matrix

Authoritative source in code: [`src/lib/permissions/roles.ts`](../src/lib/permissions/roles.ts).
Spec basis: §6 (user types), §29 (permission model). Enforcement is **server-side
only** (§45 rules 6–7); the client may read this matrix to hide UI but never to
authorize. Permissions marked 🔐 additionally require MFA at time of use (§29, §32).

## Roles → key permissions

| Permission | Visitor | Reg. Citizen | Verified | Tipster | Researcher | Journalist | Official Rep | Court/Agency Rep | Campaign Org | Moderator | Legal | Finance | Admin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| content.view_public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| claim.draft | | ✅ | ✅ | | ✅ | ✅ | | | ✅ | | | | ✅ |
| claim.submit | | | ✅ | | ✅ | ✅ | | | ✅ | | | | ✅ |
| evidence.upload | | | ✅ | | ✅ | ✅ | | | ✅ | | | | ✅ |
| petition.sign | | | ✅ | | ✅ | ✅ | | | ✅ | | | | ✅ |
| records_request.create | | | ✅ | | ✅ | ✅ | | | ✅ | | | | ✅ |
| correction.request | | ✅ | ✅ | | ✅ | ✅ | | | ✅ | | | | ✅ |
| tip.submit_confidential | | | | ✅ | | | | | | | | | ✅ |
| timeline.edit_draft | | | | | ✅ | | | | | | | | ✅ |
| claim.link_evidence | | | | | ✅ | | | | | | | | ✅ |
| claim.propose_status | | | | | ✅ | | | | | | | | ✅ |
| investigation.participate | | | | | ✅ | ✅ | | | | | | | ✅ |
| official.respond | | | | | | | ✅ | ✅ | | | | | ✅ |
| official.submit_correction | | | | | | | ✅ | ✅ | | | | | ✅ |
| official.upload_record | | | | | | | ✅ | ✅ | | | | | ✅ |
| scorecard.appeal | | | | | | | ✅ | ✅ | | | | | ✅ |
| moderation.view_queue | | | | | | | | | | ✅ | | | ✅ |
| moderation.act 🔐 | | | | | | | | | | ✅ | | | ✅ |
| evidence.redact 🔐 | | | | | | | | | | ✅ | | | ✅ |
| evidence.review | | | | | | | | | | ✅ | ✅ | | ✅ |
| legal.review | | | | | | | | | | | ✅ | | ✅ |
| legal.apply_hold 🔐 | | | | | | | | | | | ✅ | | ✅ |
| legal.restrict_publication 🔐 | | | | | | | | | | | ✅ | | ✅ |
| claim.publish 🔐 | | | | | | | | | | | ✅ | | ✅ |
| evidence.access_restricted 🔐 | | | | | | | | | | | ✅ | | ✅ |
| finance.review_expenses | | | | | | | | | | | | ✅ | ✅ |
| finance.approve_disbursement 🔐 | | | | | | | | | | | | ✅ | ✅ |
| admin.* 🔐 | | | | | | | | | | | | | ✅ |

Effective permissions = **union** of a user's roles (everyone inherits Visitor).
Roles can be granted globally or scoped to a jurisdiction/investigation/campaign
(`UserRole.scopeType`/`scopeId`), enabling e.g. a researcher elevated only within
one investigation.

## Structural safety invariants (proven by tests)

- No non-staff role can `claim.publish` — publication is Legal/Admin only, so
  serious allegations cannot auto-publish (§25.2, §45.5).
- Sensitive actions (moderate, redact, legal hold, disbursement, restricted
  evidence, admin) are denied without MFA even when the role is correct (§29,§32).
- Moderator ≠ Legal ≠ Finance: separation of duties (§34 "Founder/Moderator
  abuse" mitigation). Moderators cannot apply legal holds or move money.
