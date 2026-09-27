# HearOURVOICES

Citizen-accountability and government-transparency platform. Turns public records,
verified evidence, government actions, and court outcomes into understandable
timelines, scorecards, and lawful civic-action tools.

**Source of truth:** [`docs/HEAROURVOICES_MASTER_SPEC.md`](docs/HEAROURVOICES_MASTER_SPEC.md).
Do not add unrelated features (no gaming, gambling, sports rankings, player
markets, or general social-media mechanics — spec §3, §45).

## Status: Phase 1 — Foundation

Implemented: first-party auth (scrypt + revocable DB sessions), server-side RBAC
with MFA gating, append-only audit log, the full §28 data model in Prisma, claim
intake policy (serious allegations never auto-publish), scorecard scoring (missing
data ≠ zero), and fictional seed data. See [`docs/gap-analysis.md`](docs/gap-analysis.md)
for exactly what's done vs. pending, and [`docs/roadmap.md`](docs/roadmap.md) for
what ships next (Evidence & Review pipeline).

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local Docker, Supabase, or Neon)

## Setup

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL + secrets (never commit .env)

# Fastest path to a local database (Docker):
docker compose up -d          # starts Postgres 16 on localhost:5432
# then set in .env:
#   DATABASE_URL="postgresql://hov:hov@localhost:5432/hearourvoices?schema=public"

npm run db:generate           # generate Prisma client
npm run db:migrate            # create schema (creates migration 0001_init)
npm run db:seed               # load fictional Riverbend / Cedar County demo data
npm run dev                   # http://localhost:3000
```

Generate secrets for `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Demo login after seeding: `researcher@demo.hearourvoices.test` / `DemoPassphrase!2024`.

## No Docker? Use embedded Postgres

If you can't run Docker, the repo ships a real Postgres that needs no install:

```bash
npm run pg:dev        # boots Postgres on localhost:55432 (Ctrl-C to stop)
# in another terminal, set DATABASE_URL to the printed string, then:
npm run db:migrate && npm run db:seed && npm run dev
```

## Verify

```bash
npm run typecheck        # tsc --noEmit (strict)
npm test                 # 41 unit tests (pure logic: RBAC, MFA, intake, scoring, ledger, visibility)
npm run test:integration # 18 integration tests against a real embedded Postgres
npm run build            # production build (25 routes)
```

The integration suite boots its own throwaway Postgres — no setup required.

## Project layout

```
src/
  app/            Next.js App Router (pages + /api routes)
  lib/
    auth/         scrypt hashing, sessions, password policy
    permissions/  role→permission matrix, pure decide(), server guard
    audit/        append-only audit writer
    claims/       intake/publication policy
    scoring/      scorecard calculation (missing data ≠ zero)
    http/         response shapes, route wrapper, rate limiter
    validation/   Zod schemas
    db/           Prisma client singleton
prisma/           schema.prisma, seed.ts
tests/            Vitest suites
docs/             master spec + architecture, gap, security, permission, roadmap
```

## Key guarantees (enforced + tested)

- Authorization is **server-side**; client role checks are never trusted (§45.6-7).
- Serious allegations are routed to human review and **cannot auto-publish** (§25.2).
- Sensitive actions require **MFA** (§29, §32).
- Scorecards show **Insufficient Data** rather than scoring missing data as zero (§10.5).
- Privileged actions and authz denials are written to an **append-only audit log** (§4.6).
- All demo data is **fictional** and implies no real wrongdoing (§44).

> This repository contains product/engineering work, not legal advice. Qualified
> counsel must review before any public launch (spec §34, §39 Phase 0).
