# HearOURVOICES — Prioritized Roadmap & Next-Phase Plan

Aligns spec §39 (phased roadmap) and §47 (first build order) with what is done.

## Priority ladder

- **Phase 1 — Foundation (this build): auth, RBAC, audit, data model, claim intake
  policy, scoring policy, seed.** ✅ Largely complete (server-side; UI thin).
- **Phase 2 — Evidence & review pipeline** ← recommended next. Highest risk value:
  everything else depends on trustworthy evidence handling (§14, §31 pipeline).
- **Phase 3 — Public read surfaces:** jurisdiction brief, official/agency profiles,
  claim pages with status labels, scorecard pages, methodology page (§8–§10, §37).
- **Phase 4 — Records requests** builder + tracker (§15).
- **Phase 5 — Moderation & appeals** queue + transparency report (§23).
- **Phase 6 — Notifications & search** (§26, §27).
- **Phase 7+ —** Courts/cases, CivicFund, petitions, investigations, vote hub
  (spec §11, §16, §17, §19, §20) — each its own phase and migration.

## Recommended next phase: **Phase 2 — Evidence & Review Pipeline**

Delivers spec foundation items 7–9 and unblocks the whole claims workflow.

### File-by-file plan

| File | Purpose |
| --- | --- |
| `src/lib/storage/driver.ts` | `StorageDriver` interface: `getUploadUrl`, `getSignedDownloadUrl`, `putRedactedCopy` |
| `src/lib/storage/local.ts` | Dev driver writing under `./storage`, signs with `SESSION_SECRET`-derived HMAC + TTL |
| `src/lib/storage/s3.ts` | S3-compatible driver (staging/prod), separate ORIGINAL vs PUBLIC buckets |
| `src/lib/evidence/pipeline.ts` | Orchestrates §31 steps: hash → metadata → OCR/transcribe stub → sensitive-info flag → queue human review |
| `src/lib/evidence/chain.ts` | `recordChainEvent()` — append-only chain-of-custody writes (§14.5) |
| `src/lib/validation/evidence.ts` | Zod schemas for upload-init, complete, redaction |
| `src/app/api/evidence/upload-url/route.ts` | Issues signed upload URL (perm `evidence.upload`) |
| `src/app/api/evidence/complete/route.ts` | Finalizes upload, hashes original, writes `uploaded` chain event |
| `src/app/api/evidence/[id]/route.ts` | Metadata read with visibility enforcement |
| `src/app/api/evidence/[id]/download/route.ts` | Signed download; `access_restricted` 🔐 for originals; logs `accessed`/`downloaded` |
| `src/app/api/evidence/[id]/redactions/route.ts` | Create redacted copy → PUBLIC bucket (perm `evidence.redact` 🔐) |
| `src/app/api/evidence/[id]/verify/route.ts` | Reviewer sets verification status, integrity warnings (§14.8) |
| `src/app/api/claims/[id]/publish/route.ts` | The human publish gate (`claim.publish` 🔐), sets visibility, audits |

### Migration required?
No new tables (evidence schema already in `0001_init`). One **hardening
migration** to add a trigger making `audit_log` and `evidence_chain_events`
reject UPDATE/DELETE at the DB level (§45.18).

### Security concerns
Signed-URL TTL and scope; originals never served from a public path; redacted
copy required before any public visibility; every access is a chain event; MFA on
restricted access and redaction.

### Tests to add (§45 rule 10)
- Restricted evidence cannot be downloaded without `evidence.access_restricted` +MFA.
- A public download only ever returns the `publicStorageKey` copy, never the original.
- Redaction creates a distinct copy and never mutates the original hash.
- Every download/redaction writes an append-only chain event.
- `claim.publish` requires Legal/Admin + MFA; a verified citizen is denied.
- Publishing a claim flips visibility and writes an audit record.
