# HearOURVOICES — Feature & Database Gap Analysis

Baseline: greenfield (see [architecture.md](./architecture.md)). "Gap" = spec
requirement not yet implemented. Status legend: ✅ done in Phase 1 · 🟡 partial ·
⬜ not started.

## 1. Feature gap analysis (against §38 MVP / §47 build order)

| # | Foundation system | Status | Notes |
| --- | --- | --- | --- |
| 1 | Authentication | ✅ | register/login/logout/me, scrypt, revocable DB sessions, rate-limited |
| 2 | Roles & server-side permissions | ✅ | 13 roles, ~40 permissions, `decide()` + `requirePermission()`, MFA gate, deny-audited |
| 3 | Jurisdictions | 🟡 | schema + public list API + seed; detail/brief pages ⬜ |
| 4 | Officials & agencies | 🟡 | full schema (people, offices, terms, agencies, promises, votes) + seed; profile pages/APIs ⬜ |
| 5 | Sources & citations | 🟡 | `Source`+`Citation` schema (see §2 DB gap) + seed; management UI ⬜ |
| 6 | Claims | 🟡 | schema + submit API + intake policy + tests; review/publish APIs & pages ⬜ |
| 7 | Secure evidence uploads | ⬜ | schema ready; signed upload/download + storage driver + virus scan pipeline ⬜ |
| 8 | Evidence review & redaction | ⬜ | schema ready (`Redaction`, original vs public keys); tooling ⬜ |
| 9 | Claim–evidence relationships | 🟡 | `ClaimEvidenceLink` schema + created on submit; reviewer linking UI ⬜ |
| 10 | Public timelines | ⬜ | `CaseEvent` schema present; timeline rendering ⬜ |
| 11 | Official responses & corrections | 🟡 | schema (`OfficialResponse`, `Correction`) + seed; APIs/UI ⬜ |
| 12 | Public-record request tools | 🟡 | full schema + statuses; builder/tracker APIs & UI ⬜ |
| 13 | Basic scorecards | 🟡 | schema + `computeScore` (missing≠zero) + tests + seed; publish/appeal APIs & UI ⬜ |
| 14 | Moderation & appeals | 🟡 | schema (reports/actions/appeals) + reasons vocab; queue/APIs/UI ⬜ |
| 15 | Append-only audit logs | ✅ | `AuditLog` + insert-only helper; wired into auth/claims/authz denials |
| 16 | Search | ⬜ | PG full-text plan (§27); not started |
| 17 | Notifications | 🟡 | `Follow`+`Notification` schema; delivery + preferences ⬜ |
| 18 | Administrative tools | ⬜ | audit-log viewer, methodology manager, verification queue ⬜ |

Deliberately **out of scope** until foundations land (§38 "MVP should not include",
§47 closing note): nationwide data, live election verification, CivicFund
crowdfunding, AI publication, automated guilt labels, open unstructured commenting.

## 2. Database gap analysis (against §28)

The Phase 1 Prisma schema implements the full §28 model. Notable decisions and
**additions** flagged for review:

- **ADDED `Source` + `Citation` (foundation item 5).** §28 references `source_id`
  across `promises`, `measures`, `votes`, `official_statements`, `complaints`,
  `case_events`, `case_outcomes`, `records_request_events`, `scorecard_metrics`,
  but **never defines a sources table**. Without it, "evidence over rumors" (§4.1)
  and "show sources near claims" (§36) are impossible. `Citation` is polymorphic
  (`subjectType`+`subjectId`) so any record can cite one or more sources. This is
  a spec gap that should be reflected back into the master spec's §28 (see
  CHANGELOG / §52 process).
- **Enums for controlled vocabularies.** Spec status lists (§9.3 promise statuses,
  §13.2 claim types, §13.3 confidence labels, §14.7 visibility, §15.3 request
  statuses, §23 moderation) are encoded as Postgres enums so labels can't drift.
- **`Scorecard.overallScore` is nullable** and `insufficientData` defaults `true`
  — enforces §10.5 "missing data ≠ zero" at the schema level.
- **Evidence stores `originalStorageKey` and `publicStorageKey` separately** plus
  `originalHash`/`processedHash` — enforces §14.4 original-vs-redacted separation.
- **Later-phase tables modeled now** (courts, cases, charges, outcomes) to avoid
  churn, but no APIs yet. They carry `visibility`/`sealingStatus`/`protected`
  fields for §12.4 sealing/expungement/victim protection.
- **Still missing from schema (later phases):** CivicFund tables (§28.7 —
  `campaigns`, `contributions`, `campaign_expenses`, ledgers), petitions/action
  (§28.8), investigations (§28.9). Intentionally deferred to Phases 3–5; they will
  each require their own migration.

## 3. Migrations required

- **`0001_init`** — the entire Phase 1 schema (identity/access, government
  structure, sources/citations, accountability, courts/cases, claims/evidence,
  scorecards, records, moderation/reputation/audit, notifications). Generate with
  `npm run db:migrate` against a Postgres `DATABASE_URL`.
- Future: `0002_civicfund`, `0003_petitions`, `0004_investigations` as those
  phases begin. Audit-log immutability should additionally be enforced at the DB
  level (a trigger blocking UPDATE/DELETE on `audit_log`) — planned for `0001`'s
  follow-up hardening migration.
