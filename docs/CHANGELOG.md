# HearOURVOICES — Change Log

Per spec §52/§54, product-rule and architecture changes are recorded here. The
master specification remains the source of truth; when an approved product rule
changes, update `HEAROURVOICES_MASTER_SPEC.md` **and** add an entry here.

## Unreleased — Admin system + moderation backend

Staff logins and an admin dashboard, with the moderation backend behind it.

### Added
- `User.isModerator` / `User.isAdmin` (+ migration). Server-side gates
  `requireModerator()` / `requireAdmin()` (`src/lib/auth/admin.ts`).
- Admin service (`src/lib/admin/service.ts`): overview counts, review queue (held
  stories + reports), approve/remove moderation, set claim status, list users,
  grant/revoke journalist·moderator·admin, suspend. All audited.
- Admin APIs under `/api/admin/*` (overview, queue, stories/[id]/moderate,
  reports/[id]/moderate, reports/[id]/status, users, users/[id]/capability).
- **`/admin` dashboard** (staff login → stats, review queue with approve/remove +
  claim-status control, users table with role grants + suspend). Footer "Staff
  sign-in" link.
- Seeded admin account: `admin@hearourvoices.local` / `Admin-hearOURvoices-2026!`
  (change in production) + one held story so the queue demonstrates immediately.

### Verified (live)
- Admin API → 401 signed out, 403 for normal users, 200 for admin; overview shows
  held counts; queue lists held items; users list works. 60 unit + 40 integration
  tests; build (36 pages).

## Unreleased — Community Reports (two lanes; retires the "Rumors" name)

Consolidated the reporting features into one **Community Reports** feature with two
clearly separated lanes. The public "Rumors" name is gone (defamation/reliability
risk); the standalone journalist feature is folded in here.

### Lane 1 — Citizen Tips & Opinions
- Any signed-in user posts opinions, concerns, unverified tips, questions, or
  firsthand accounts. **A visible label is required**: Opinion · Unverified tip ·
  Firsthand account · Evidence submitted · Correction issued · Verified by records ·
  Disproven (422 without one).
- **No instant accuracy grade** — posts start **Unreviewed**. Instead we build a
  **contributor track record** (verified vs disproven, voluntary corrections,
  evidence quality, source transparency, fact/opinion separation), so no one is
  punished while records take months to obtain.

### Lane 2 — Independent Civic Journalists (higher-trust, earned)
- Gated by qualification (403 until earned). Structured report **requires**: the
  exact claim, what the source shows, what it does NOT prove, confirmed/unconfirmed
  parts, origin, why it matters, source link, the affected party's response (or "did
  not respond"), disclosed conflicts, and a neutrality/transparency affirmation. A
  loaded-language check flags editorializing.
- **Qualify after a good record**: `POST /api/journalist/apply` grants the lane when
  the contributor record meets the bar.

### Claim status (not stars), evolving over time
- `ReportClaimStatus`: Unreviewed · Unverified · Evidence developing · Partially
  supported · Verified · Disputed · Disproven · Retracted. Reviewers move status
  with a rationale (append-only status history). Corrections are visible.

### Added / changed
- Models: `CommunityReport`, `CommunityReportCorrection`, `ClaimStatusEvent`,
  `User.isJournalist` (+ migration). Removed the interim `Report` model.
- `reports/{labels,record,journalist,neutrality,service}.ts`; APIs `GET/POST
  /api/reports`, `/[id]/status`, `/[id]/correction`, `/api/journalist/apply`; UI
  `/reports` (two-lane tabs, submit forms, journalist application) + `/reports/[id]`.

### Verified (live)
- Both lanes' feeds render; citizen post without a label → 422; valid post starts
  Unreviewed; journalist lane without qualifying → 403; eligibility reflects the
  record. 60 unit + 36 integration tests; build (35 pages).

## Unreleased — Independent Journalist Reports (replaces Rumors in the nav)

A structured, neutral reporting section. "Reports" takes the Rumors nav slot;
Rumors stays flag-hidden.

### Rules enforced (validation + service)
- **Labeled by type** — Rumor / Verified / Opinion / Developing. A RUMOR is always
  shown as **"RUMOR · Unverified."**
- **What was actually said** — a faithful written account is required (min length).
- **Source link required** — every report must link the video/article.
- **Why it matters** — required.
- **Neutrality** — the reporter must affirm a neutrality pledge (422 without it),
  and a loaded-language check flags editorializing terms for transparency (shown,
  not blocked). Reuses the safety screen (threats/doxxing held for review).

### Added
- `Report` model + migration + seed (a verified report and a labeled rumor).
- `reports/neutrality.ts` (pure + tested), service, `GET/POST /api/reports`, and UI:
  `/reports` (feed with type badges + submit form) and `/reports/[id]` (what-was-said,
  source link, why-it-matters, neutrality note). "Reports" added to nav + footer.

### Verified (live)
- Seeded feed shows a labeled RUMOR + VERIFIED report.
- Missing neutrality pledge → 422; missing source URL → 422; a loaded-wording report
  publishes but is flagged (`["disgraceful","obviously"]`). 60 unit + 34 integration
  tests; build (35 pages).

## Unreleased — Rumors hidden behind a feature flag (OFF by default)

Per product decision, the Rumors board is **taken out of the live product** but the
code is kept. Gated by `RUMORS_ENABLED` (default `false`, `src/lib/flags.ts`):
- `/rumors` + `/rumors/[id]` return 404 when off; the `/api/rumors*` routes 404.
- "Rumors" is removed from the nav, mobile menu, and footer when off.
- Nothing deleted — DB tables, service, tests, and UI remain. Set
  `RUMORS_ENABLED=true` to turn it back on (verified: pages/APIs return 200 and the
  nav link reappears).

Reason: a public rumor board about people needs a moderation queue + legal review
before going live.

## Unreleased — Rumors: accuracy-graded board

People post a rumor/opinion and the platform **grades how accurate it is**.

### Added
- Data model: `Rumor`, `RumorVote` (one per user), `RumorEvidence` (+ optional
  reviewer verdict) + migration + seed of demo rumors across all grades.
- **Grading engine** (`rumors/grading.ts`, pure + tested): community votes → a
  0–100 accuracy score + grade (Accurate → Inaccurate) + confidence. Reviewer
  verdict overrides the crowd. **Too few votes → "Unverified"** (never a made-up
  verdict). Reuses the story safety screen (threats/doxxing held).
- Service + API: `GET/POST /api/rumors`, `POST /api/rumors/[id]/vote`,
  `POST /api/rumors/[id]/evidence`.
- UI: `/rumors` (feed with accuracy badges + meters + compose box), `/rumors/[id]`
  (vote Accurate/Inaccurate, live grade, add supporting/refuting evidence with a
  source link). Added "Rumors" to nav + footer.

### Verified (live)
- Seeded rumors grade correctly (TRUE 85%, MIXED 52%, FALSE 12%, UNVERIFIED).
- Live: post → 401 without login; posts start Unverified; 6 accurate votes →
  Accurate 100%; evidence attaches. 57 unit + 30 integration tests; build (34 pages).

## Unreleased — Stories backend + full app (story-sharing platform)

### Added — working Stories product
- Data model: `Story`, `StorySupport`, `StoryComment`, `Topic`, `SupportResource`
  (+ migration + seed of topics, support resources, and demo stories).
- **Safety screen** (`stories/safety.ts`): routes threats/doxxing to review, flags
  author-in-crisis posts (offers support, never blocks) — the "Safe & Moderated" gate.
- Stories service + API: `GET/POST /api/stories` (feed + share, topic filter,
  cursor), `POST /api/stories/[id]/support` (one-per-user heart), `.../comments`,
  `GET /api/topics`, `GET /api/resources`. Posting requires a signed-in account;
  reading is public.
- Wired front-end: `/stories` (real feed + topic filter), `/stories/[id]` (detail +
  supportive comments + support button), `/share` (real submit with crisis + review
  handling), `/topics`, `/resources` (Community Support), and a new `/community` page.

### Verified (live, end-to-end)
- 51 unit + 26 integration tests pass; `tsc` clean; `next build` (33 pages).
- Live loop against the DB: unauthenticated share → 401; register → share → PUBLISHED;
  support toggles count; comment posts; a crisis post publishes with a support flag;
  a threat post is HELD for review and kept out of the feed.

## Unreleased — PRODUCT PIVOT: story-sharing platform (2026-07-12)

The user redirected the product from **civic accountability** to a **personal
story-sharing & community-support platform** (from a provided design mockup;
decision: "Build the mockup — pivot to story-sharing").

> ⚠️ The master spec (`HEAROURVOICES_MASTER_SPEC.md`) still describes the OLD
> civic product and is now out of sync. The civic code (officials, scorecards,
> FOIA, elections, CivicFund) is **legacy**. The spec should be rewritten for the
> story platform before further product work.

### Added — new front-end (the live product)
- Dark, bold design system `src/app/theme.css` (scoped under `.hov-root`).
- **Landing page** (`/`) matching the mockup: hero "Your Voice Matters. Your Story
  Has Power.", trust badges, stats bar, "How hearOURvoices Works" (4 steps), app
  showcase with 3 phone mockups, partners, footer.
- **Browse Stories** (`/stories`) — themed feed with topic filters (demo stories).
- **Share Your Story** (`/share`) — interactive form: write, tag chips, post-
  anonymously + hide-location toggles (UI; backend submit is next).
- **Sign Up / Log In** (`/signup`, `/login`) — **functional**, wired to the
  existing `/api/auth/register` + `/api/auth/login`.
- New brand: `HovLogo` (speech bubble + red soundwave), `HovShell` (shared nav +
  footer), updated favicon/OG/manifest metadata.

### Changed
- Root layout now loads `theme.css` (new product) instead of the civic CSS
  globally; legacy civic pages import their own CSS locally so they stay styled
  and the new dark theme can't leak. Civic dashboard moved to `/community` earlier
  remains as legacy.

### Not yet built (next)
- Stories backend: `Story` model, feed API, share-submit with the "Safe &
  Moderated" review pipeline, comments/support reactions, Topics & Resources
  pages, Community page. Placeholder partner logos + stats need real data.

### Verified
- `tsc` clean; `next build` succeeds (31 pages); landing + `/stories` `/share`
  `/signup` `/login` render at HTTP 200 with the new theme.

## Unreleased — Phase 4 (Production website & deploy-readiness)

### Added — public marketing site
- Polished **landing page** at `/` (hero, "five questions", how-it-works, features,
  trust band, CTA) with a real design system (`marketing.css`).
- Shared **SiteHeader** (sticky, responsive, no-JS mobile menu) + **SiteFooter**.
- **Brand**: SVG logo mark (speech bubble + soundwave, §36), wordmark.
- New pages: `/how-it-works`, `/about`, `/privacy`, `/terms`. The app dashboard
  moved from `/` to **`/community`**; content pages (elections, methodology) now
  share the site header/footer.

### Added — production polish
- Full **SEO**: metadataBase, Open Graph + Twitter cards, per-page titles, keywords.
- **PWA** manifest + theme color; `icon.svg` favicon, `og.svg` share image.
- `sitemap.xml` (dynamic), `robots.txt`, `security.txt` (vuln disclosure, §32).
- Custom **404** (`not-found.tsx`) and **error boundary** (`error.tsx`).
- Real **Content-Security-Policy** + HSTS and hardened headers in `next.config`.

### Added — deployment
- `output: 'standalone'`, `Dockerfile` + `.dockerignore` (runs `prisma migrate
  deploy` on start), `vercel.json` (build + apex→www redirect), and
  **`docs/DEPLOYMENT.md`** with exact `www.` domain/DNS steps.

### Verified
- `tsc` clean; `next build` succeeds (27 pages); all routes return 200 (404 page
  works); sitemap/robots/manifest/icon/og serve with correct content types; 47
  unit tests pass.

### Not done from here (needs your accounts)
Registering a domain and pushing live require your registrar + host logins and
payment — can't be done from this session. Everything is deploy-ready; see
`docs/DEPLOYMENT.md`.

## Unreleased — Phase 3 (Elections, plain-language UX, integration seams)

### Added — Elections & Candidate Guide (§18, §19)
- Data model: `Election`, `Race`, `Candidate`, `CandidatePosition` (for/against),
  `CandidateProsCon`. Migration + fictional seed (Riverbend mayoral race, 2 candidates).
- Service (`getTimelyElection`, `getElectionGuide`, `listElections`) + `GET /api/elections`.
- **Very simple `/elections` page**: plain 4th-grade-reading-level copy, big text,
  side-by-side candidates, clear "✅ What they want (FOR)" / "🚫 AGAINST", 👍/👎 pros & cons.
- **Timely surfacing**: the home page auto-shows a "🗳️ Voting is coming up" banner when
  an election is within 90 days, so important moments appear up front.

### Added — plain-language navigation
- Sidebar relabeled to plain words ("What's new near me", "See who's running",
  "Look up a leader", "Ask for records", "How we check facts") as real links.

### Finished — integration seams (working dev impl + real adapter behind each)
- **TOTP MFA enrollment** (§32): full RFC-6238 (no dependency), `POST /api/auth/mfa/setup|enable`.
  Verified live end-to-end (enable with a real authenticator code → mfaEnabled=true).
- **Identity/KYC** (§6.3): provider seam + mock; `POST /api/identity/start|complete`
  promotes a Registered → Verified Citizen. Verified live (role granted, account activated).
- **Payments** (§16.7): `PaymentProvider` seam, `MockPaymentProvider` (dev) +
  `StripePaymentProvider` adapter; fees computed **server-side**; contribute route uses it.
- **Malware scan** (§31/§32): pluggable `scanBytes` wired into evidence upload; rejects EICAR.
- **S3 storage driver** (§32): full `StorageDriver` impl behind a guarded optional AWS SDK import.
- **Full-text search** (§27): claims now use Postgres `to_tsvector/plainto_tsquery` (was `contains`).

### Fixed (found by running it)
- S3 driver broke `next build` (webpack resolving optional AWS SDK) → `webpackIgnore`.

### Verified
- 47 unit + 21 integration tests pass; `tsc` clean; `next build` succeeds.
- Live: Elections page + home banner render; MFA enroll, identity→Verified, verified
  claim submit, and CivicFund contribution with server-computed fees all confirmed.

### Still needs external accounts/credentials (seam finished, not "live")
Real Stripe money movement (adapter present), a production KYC vendor (mock auto-approves),
a real malware engine (dev checks EICAR), an S3 bucket (driver present), email delivery.
And per the spec: qualified legal review before any real-data pilot.

## Unreleased — Phase 2+ (backend build-out across all phases)

### Added — verification infrastructure
- **Embedded Postgres** (`scripts/embedded-pg.mjs`) — runs a real Postgres 18 with
  no Docker/admin install, for local dev (`npm run pg:dev`) and CI.
- **Integration test harness** (`vitest.integration.config.ts` + `tests-integration/`)
  — boots a real DB, pushes the schema, seeds roles, runs tests against it.
- Real Prisma **migrations** committed: `..._init` and `..._civicfund_petitions_investigations`.

### Added — data model
- CivicFund (§28.7: `Campaign`, `Contribution`, `CampaignExpense`, `CampaignMilestone`,
  `CampaignUpdate`), Petitions/Action (§28.8), Investigations (§28.9). Closes the
  deferred-tables gap from the original DB gap analysis.

### Added — service layer + API routes (all validated, permissioned, audited)
- **Evidence** (§14): upload (original→restricted bucket), redaction (distinct
  public copy, original untouched), chain-of-custody, access resolution + signed
  storage URLs. Routes: `POST /api/evidence`, `/[id]/redactions`, `/[id]/download`,
  `/api/storage/[op]`.
- **Claims** (§13.5): submit → review → human publish gate. Routes: `/api/claims/[id]/reviews|publish|responses`.
- **Moderation** (§23): report, act (reason required), appeal (different reviewer). Routes: `/api/moderation/reports|actions`.
- **Official response & correction** (§24).
- **CivicFund** (§16): campaigns, contributions, expense approval gated on available
  funds, transparent ledger. Routes: `/api/campaigns`, `/[id]/contribute`, `/[id]/ledger`.
- **Records requests** (§15), **Petitions** (§17, one-signature-per-user), **Scorecards**
  (§10, missing-data persisted as null), **Notifications/follows** (§26), **Search** (§27).

### Fixed (found by running it)
- **scrypt maxmem**: hashing threw `ERR_CRYPTO_INVALID_SCRYPT_PARAMS` because
  N=32768,r=8 needs ~34MB > OpenSSL's 32MB default. Raised `maxmem`. Would have
  broken all password hashing in production.

### Verified
- 41 unit tests + 18 integration tests (against real Postgres) pass; `tsc` clean;
  `next build` succeeds (25 routes); live HTTP smoke test confirms auth, seeded
  reads, and server-side RBAC denials (403) end-to-end.

## Unreleased — Phase 1.2 (hardening & quality)

### Added
- **Content-visibility policy** (`src/lib/permissions/visibility.ts`): full 8-tier
  server-side model (§14.7) with `canViewContent` + `evidenceCopyFor` (original
  never served to non-privileged/non-MFA viewers). 12 tests.
- **Accessible dialogs** (§35): Escape-to-close, focus trap, focus return, scroll
  lock for the timeline modal; Escape + backdrop scrim for the mobile nav drawer.
- **Public methodology page** `/methodology` (§4.7, §10.6, §34 labels).
- **Health endpoint** `/api/health` — liveness + non-throwing DB readiness (§32).
- **`docker-compose.yml`** — one-command local Postgres for dev.
- **CI** (`.github/workflows/ci.yml`): prisma validate, typecheck, tests, build.
- **ESLint** config + deps so `npm run lint` runs.

### Fixed
- `evidenceCopyFor` bug caught by new tests: a public-copy fallback was always
  truthy, so it could return `public` for content a viewer couldn't see. Now
  returns `none` when the item isn't viewable.

## Unreleased — Phase 1.1 (UI merge)

### Added
- Ported the standalone Vite MVP's **Community Brief dashboard** into the Next.js
  app as the home page (`src/components/CommunityDashboard.tsx`, `src/app/dashboard.css`).
  Demo content moved to `src/lib/demo/community.ts` (fictional, §44).

### Changed
- Home route (`/`) now renders the dashboard instead of the placeholder landing.
- `globals.css` trimmed to non-conflicting base rules; design system lives in `dashboard.css`.

### Removed / superseded
- The MVP's client-side `src/security.ts` policy stub is **not** carried over. It is
  superseded by the server-side RBAC in `src/lib/permissions/*` (its role names
  differed and client checks are non-authoritative — §45 rules 6-7). Its test
  intent (citizens can't publish allegations; restricted evidence gated) is already
  covered by `tests/permissions.test.ts`.

### Fixed
- Public `GET /api/jurisdictions` returned 401 to anonymous visitors because it ran
  through the privileged guard. Public reads now bypass `requirePermission` (§6.1).

## Unreleased — Phase 1 (Foundation)

### Added
- Repository scaffolded as a clean, isolated Next.js 14 + TypeScript (strict) app.
- Full §28 data model in Prisma (`prisma/schema.prisma`), incl. courts/cases modeled early.
- First-party auth: scrypt hashing, revocable DB-backed sessions, register/login/logout/me APIs.
- Server-side RBAC: 13 roles, ~40 permissions, pure `decide()`, `requirePermission()` guard, MFA gating, deny-auditing.
- Append-only audit log + insert-only writer.
- Claim intake policy (serious allegations → human review; nothing auto-publishes).
- Scorecard scoring (`computeScore`) enforcing "missing data ≠ zero".
- Fictional Riverbend/Cedar County seed data.
- Vitest suites (26 tests) for permissions, MFA, claim intake, scoring, password policy.
- Docs: architecture (+ADR-0001), gap analysis, security assessment, permission matrix, roadmap.

### Product-rule notes (require master-spec reflection)
- **DB gap → addition:** introduced `Source` + polymorphic `Citation` tables. §28
  references `source_id` throughout but never defines a sources table. Master spec
  §28 should be updated to define these. No product-rule *change*, a gap fix.

### Architecture decisions
- **ADR-0001:** single Next.js app instead of the §46 Turborepo monorepo (deferred,
  not rejected). See `docs/architecture.md`.
- Auth implemented first-party (matches §28.1 sessions table) rather than an
  external provider; scrypt substituted for argon2 for portability. Security-neutral.

### Not yet implemented
See `docs/gap-analysis.md`. Next: Phase 2 Evidence & Review pipeline (`docs/roadmap.md`).
