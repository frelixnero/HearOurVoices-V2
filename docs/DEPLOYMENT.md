# Deploying HearOURVOICES to production (with a `www.` domain)

This app is production-ready. Going live is three things: **a database, a host, and a
domain.** Below is the fastest path (Vercel + a managed Postgres) and a
container path (Docker).

---

## 0. What you need
- A domain name (e.g. `hearourvoices.org`) from any registrar (Namecheap, Cloudflare,
  Google Domains, etc.). ~$10–15/year.
- A managed Postgres database (Neon, Supabase, or Vercel Postgres — free tiers exist).
- A host account (Vercel is easiest for Next.js; free hobby tier works to start).

> Note: buying the domain and creating these accounts must be done by you — they
> require payment and login. Everything else is already built.

---

## 1. Create the database
Pick one and copy its connection string:
- **Neon**: neon.tech → create project → copy the `postgresql://…` URL.
- **Supabase**: supabase.com → new project → Settings ▸ Database ▸ Connection string.

Keep it for `DATABASE_URL`.

---

## 2. Deploy to Vercel (recommended)
1. Push this repo to GitHub.
2. vercel.com → **New Project** → import the repo. Vercel auto-detects Next.js.
3. Add **Environment Variables** (Settings ▸ Environment Variables). Minimum:
   ```
   DATABASE_URL      = <your postgres url>
   SESSION_SECRET    = <run: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))">
   IP_HASH_PEPPER    = <another random string from the same command>
   APP_BASE_URL      = https://www.hearourvoices.org
   NODE_ENV          = production
   PAYMENT_PROVIDER  = mock        # switch to `stripe` once Connect is set up
   IDENTITY_PROVIDER = mock        # switch to a real KYC vendor for launch
   SCAN_PROVIDER     = dev         # switch to a real scanner for launch
   STORAGE_DRIVER    = s3          # + S3_* vars below (or `local` only for testing)
   ```
   For S3 evidence storage add: `S3_REGION, S3_ENDPOINT, S3_BUCKET_ORIGINALS,
   S3_BUCKET_PUBLIC, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY`, and
   `npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
4. Deploy. `vercel.json` runs `prisma migrate deploy` during the build, so the
   schema is created automatically.
5. **Seed a pilot** (optional, one time): from your machine with the production
   `DATABASE_URL` exported, run `npm run db:seed` — but use *real* pilot data, not
   the fictional demo, for a live jurisdiction.

---

## 3. Point your `www.` domain
In Vercel: **Project ▸ Settings ▸ Domains ▸ Add** → enter `www.hearourvoices.org`
and `hearourvoices.org`. Vercel shows the exact records; set them at your registrar's
DNS panel:

| Type  | Name / Host | Value                     |
| ----- | ----------- | ------------------------- |
| CNAME | `www`       | `cname.vercel-dns.com`    |
| A     | `@` (apex)  | `76.76.21.21`             |

- Set **`www` as the primary domain** in Vercel; the apex redirects to it
  (also enforced by `vercel.json`).
- DNS takes minutes to a few hours. Vercel issues the HTTPS certificate
  automatically. `https://www.hearourvoices.org` is now live.

*(Using Cloudflare DNS? Add the same records with proxy status "DNS only" first,
then you can enable the proxy.)*

---

## Alternative: Docker (any VPS / cloud run)
```bash
docker build -t hearourvoices .
docker run -p 3000:3000 --env-file .env hearourvoices
```
The container runs `prisma migrate deploy` on start, then serves on port 3000.
Put Nginx/Caddy (or your cloud's load balancer) in front for TLS and route your
`www` domain to it. `output: 'standalone'` keeps the image small.

---

## 4. Before a real public launch (do not skip)
These are built as swappable seams but need real accounts/keys + review:
- **Stripe Connect** for CivicFund money movement (`PAYMENT_PROVIDER=stripe`).
- **A real KYC vendor** for identity verification (`IDENTITY_PROVIDER`).
- **A real malware scanner** for evidence (`SCAN_PROVIDER`).
- **Email delivery** (`RESEND_API_KEY`) for verification + notifications.
- **Backups, error monitoring, and an `audit_log` immutability trigger.**
- **Qualified legal review** (defamation, privacy, records law, election law) — see
  `HEAROURVOICES_MASTER_SPEC.md` §34.

---

## Quick checklist
- [ ] Domain purchased
- [ ] Postgres created, `DATABASE_URL` set
- [ ] `SESSION_SECRET` + `IP_HASH_PEPPER` generated
- [ ] Deployed (migrations ran)
- [ ] `www` + apex domains added, DNS records set, HTTPS green
- [ ] Storage/payments/identity/scan providers configured for launch
- [ ] Legal review complete
