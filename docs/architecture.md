# HearOURVOICES — Architecture

Source of truth: [`HEAROURVOICES_MASTER_SPEC.md`](./HEAROURVOICES_MASTER_SPEC.md). This
document records the **current-state audit** and the **chosen architecture**, and
holds Architecture Decision Records (ADRs). Per spec §45, no major architecture
change becomes permanent without an ADR here.

## 1. Current-state audit (as of Phase 1 start)

**Finding: greenfield.** There was no pre-existing HearOURVOICES codebase.

- `Desktop/HearOURVoices/` was empty. This repo is created there.
- The nearby `OneDrive/Documents` git repo contains only **unrelated projects**
  the spec forbids mixing in (§3): `BilliardsLadder`, `Action Market Export`,
  `shadow-vail` (a Godot game), plus StarCraft/Warcraft folders. **None were
  touched.** HearOURVOICES is a clean, separate repository, satisfying §3 & §45.1.
- No prior schema, auth, or API to preserve or refactor.

## 2. Chosen architecture

| Concern | Decision | Spec basis |
| --- | --- | --- |
| Framework | Next.js 14 (App Router), React 18 | §31 front end |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` | §45 coding rules 1–2 |
| DB | PostgreSQL via Prisma ORM (migrations) | §28, §31, §45 rule 4 |
| Auth | First-party: scrypt password hashing, DB-backed revocable sessions, cookie holds token, DB holds hash | §28.1, §32 |
| Authorization | Server-side RBAC guard on every privileged route; MFA gate on sensitive perms | §29, §45 rules 5–7 |
| Validation | Zod on every API input | §45 rule 3 |
| Object storage | Driver abstraction; `local` for dev, S3-compatible for staging/prod; separate ORIGINAL vs PUBLIC buckets; signed URLs | §14.4, §31, §32 |
| Audit | Append-only `AuditLog`, insert-only helper (no update/delete in app code) | §28.11, §4.6 |
| Tests | Vitest | §45 rule 10 |

### Password hashing note
The spec (§31) lists Supabase Auth/Clerk/Auth0 as options but also defines a
first-party `sessions` table (§28.1) and `/api/auth/*` routes (§30). We implement
first-party auth to match that data model and keep the system self-contained and
fully testable. Hashing uses Node's built-in **scrypt** (memory-hard, no native
build dependency) rather than argon2, which avoids Windows/CI native-build
failures. This is a security-neutral-to-positive substitution.

## ADR-0001 — Single Next.js app instead of a Turborepo monorepo

**Status:** Accepted (Phase 1).

**Context.** Spec §46 recommends a monorepo (`apps/web|admin|worker`,
`packages/*`). That structure adds Turborepo/workspace tooling overhead that slows
the foundation and offers little value while there is one app and one developer.

**Decision.** Build a single Next.js app with a clean internal module layout under
`src/lib/*` that mirrors the spec's package boundaries (`auth`, `permissions`,
`audit`, `scoring`, `evidence`, …). Admin and worker start as route groups /
scripts and can be extracted into separate apps later without changing module
APIs.

**Consequences.** Faster iteration now; a future extraction to the §46 layout is a
mechanical move because boundaries are already respected. Revisit at Phase 4
(CivicFund needs a worker for payment/webhook processing) or when a second app
(admin) justifies its own deploy target.

**Migration required:** No. **Tests affected:** No.
