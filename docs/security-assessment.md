# HearOURVOICES — Security & Privacy Risk Assessment

Against spec §32 (security), §33 (privacy), §34 (legal risk). Status: 🟢 addressed
in Phase 1 · 🟡 partial/scaffolded · 🔴 open (later phase).

## Controls status

| Control (spec ref) | Status | Implementation / gap |
| --- | --- | --- |
| Encryption in transit (§32) | 🟡 | HTTPS at deploy/proxy layer; enforce HSTS before launch |
| Encryption at rest (§32) | 🟡 | Managed Postgres + object store at-rest encryption; app-level field encryption for `IdentityVerification.encryptedReference` still 🔴 |
| Strong password policy (§32) | 🟢 | `checkPasswordStrength`: 12+ chars, mixed classes, common-list block; tested |
| Password storage (§32) | 🟢 | scrypt (memory-hard), per-password salt, `timingSafeEqual` |
| Session revocation (§32) | 🟢 | DB-backed sessions, `revokedAt`, cookie stores token, DB stores SHA-256 hash |
| MFA for privileged users (§29, §32) | 🟡 | Enforced at authorization (`MFA_REQUIRED_PERMISSIONS` denies sensitive actions without MFA); TOTP enrollment flow 🔴 |
| Server-side authorization (§45.6-7) | 🟢 | `requirePermission()` on privileged routes; never trusts client roles |
| Least privilege (§32) | 🟢 | Additive role→permission matrix, explicit admin set (no wildcard) |
| Rate limiting (§32, §22) | 🟡 | Fixed-window limiter on auth + claim submit; **in-memory only — must move to Redis/shared store for multi-instance** |
| Signed file URLs (§32) | 🔴 | Storage driver interface planned; upload/download signing is the top Phase-2 item |
| Audit logging (§32, §4.6) | 🟢 | Append-only `AuditLog`; insert-only helper; wired to auth, claim submit, authz denials |
| Audit immutability (§45.18) | 🟡 | App code never updates/deletes; **DB trigger to block UPDATE/DELETE on `audit_log` still to add** |
| IP privacy (§33) | 🟢 | IPs peppered+hashed (`hashIp`), never stored raw |
| Duplicate-submission protection (§45.19) | 🟡 | Idempotency check on claim submit; broaden to all mutating forms |
| Input validation (§45.3) | 🟢 | Zod on every implemented API input |
| Security headers (§32) | 🟡 | `nosniff`, `DENY` frame, referrer, permissions-policy set; full CSP before launch |
| Malware scanning (§32, §31 pipeline) | 🔴 | Part of evidence upload pipeline (Phase 2) |
| Dependency scanning (§32) | 🟡 | `npm audit` available; wire into CI |
| Backups / DR / incident response (§32) | 🔴 | Ops task before pilot |

## High-risk data handling (§32 "High-Risk Data")

- **Confidential tips / whistleblower info:** restricted-queue model in the role
  matrix (`CONFIDENTIAL_TIPSTER` → `tip.submit_confidential` only). Anonymous
  public accusations are structurally impossible — tips have no publish path and
  claims require a verified submitter (§6.4, §45.6). Intake UI is a later phase.
- **Unredacted evidence:** schema separates `originalStorageKey` (restricted) from
  `publicStorageKey` (redacted). `evidence.access_restricted` is MFA-gated.
- **Identity-verification records:** only an `encryptedReference` pointer is stored
  (§32); raw documents never enter Postgres.
- **Precise addresses:** `UserProfile.publicLocationLevel` defaults to `none`;
  system derives jurisdiction without exposing address (§8.1, §33).

## Privacy (§33)

- Data minimization: no demographic collection in Phase 1; profile location level
  is opt-in and coarse.
- Login/registration avoid user-enumeration (uniform errors, constant-time-ish
  verify against a dummy hash).
- Correction/deletion rights: `Correction` records are visible+timestamped; a
  full data-subject request flow is a later phase.

## Top open items before any real-data pilot (§48)

1. Signed upload/download URLs + malware scan (Phase 2, blocks real evidence).
2. Shared-store rate limiting.
3. `audit_log` immutability DB trigger.
4. TOTP MFA enrollment (enforcement already gates actions).
5. Full CSP, HSTS, backups, error monitoring, DR runbook.
6. **Qualified legal review** (§34, §39 Phase 0) — product guidance only, not legal advice.
