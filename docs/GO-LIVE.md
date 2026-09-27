# Go live — hearOURvoices

Two options: put the **landing page** live in ~1 minute, or the **full app** (with
database, sign-in, stories, community reports) in ~10 minutes. Both are free to start.

> Why the assistant couldn't click "deploy" for you: the Vercel connection in the
> chat session returns **403 (no permission to create a project)**, and a chat
> session can't run the interactive Vercel login. You have to click deploy while
> signed into your own Vercel — the steps below take a few minutes.

---

## Option A — Landing page live in ~1 minute (no account setup, no database)
A ready, self-contained landing page is in **`landing/index.html`**.

**Easiest (drag & drop):**
1. Go to **https://app.netlify.com/drop** (or Vercel: https://vercel.com/new).
2. Drag the **`landing`** folder onto the page.
3. Done — you get a live URL like `https://hearourvoices.netlify.app`. Share it.

That's the real brand + design, live. It's a marketing/coming-soon page — no
sign-in or posting (those need the full app below).

---

## Option B — Full app live in ~10 minutes (Stories, Community Reports, sign-in)

### 1. Create a free Postgres database
- **Neon** (neon.tech) → New Project → copy the `postgresql://…` connection string.
  (Supabase or Vercel Postgres work too.)

### 2. Push this repo to GitHub
```bash
cd Desktop/HearOURVoices
gh repo create hearourvoices --private --source=. --push   # or use github.com UI
```

### 3. Import to Vercel
- vercel.com → **Add New ▸ Project** → import the `hearourvoices` repo.
- **Environment Variables** (Settings ▸ Environment Variables), add:
  ```
  DATABASE_URL     = <your Neon connection string>
  SESSION_SECRET   = <run: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))">
  IP_HASH_PEPPER   = <run the same command again for a second value>
  APP_BASE_URL     = https://<your-project>.vercel.app
  RUMORS_ENABLED   = false
  ```
- Click **Deploy**. `vercel.json` runs `prisma migrate deploy` during the build, so
  the database schema is created automatically.

### 4. (Optional) seed demo content + the admin account
From your machine, with the production `DATABASE_URL` exported:
```bash
npm run db:seed && npx tsx prisma/seed-stories.ts
```
This also creates a **staff admin account**:
- **URL:** `/admin`
- **Email:** `admin@hearourvoices.local`
- **Password:** `Admin-hearOURvoices-2026!`  ← **change this immediately in production.**

From `/admin` you can: review the safety queue (approve/remove held stories &
reports), set a report's claim status, and manage users (grant/revoke
moderator · journalist · admin, or suspend). Moderators see the queue; admins
also see Users.

### 5. Add your `www.` domain (optional)
- Vercel → Project ▸ Settings ▸ **Domains** ▸ add `www.yourdomain.com` + `yourdomain.com`.
- At your registrar's DNS, add the records Vercel shows:
  | Type  | Name  | Value                  |
  | ----- | ----- | ---------------------- |
  | CNAME | `www` | `cname.vercel-dns.com` |
  | A     | `@`   | `76.76.21.21`          |
- HTTPS is issued automatically. `vercel.json` redirects the apex to `www`.

---

## Before a real public launch (reminders)
- Real email (verification/notifications), backups, and error monitoring.
- A moderator review queue for held stories/reports + setting claim status.
- Swap the dev providers for real ones (payments/KYC/malware/storage) if used.
- **Legal review** — a story + community-reports platform about real people should
  be reviewed by qualified counsel first.
