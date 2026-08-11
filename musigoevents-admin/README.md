# GreenFlag Waitlist Outreach — Admin Page

A small, standalone app (not part of the GreenFlag dating app codebase) for
reaching out to musigoevents.com waitlist signups over WhatsApp. Meant to be
deployed on its own subdomain, e.g. `admin.musigoevents.com`.

## What it does

- Reads the waitlist Google Sheet live (via its public CSV export — no
  Google credentials needed).
- Shows every registrant with stats (total, men/women split, contacted,
  waiting 2+ days).
- Search, filter by gender, hide already-contacted people, sort by newest
  or oldest signup.
- One click opens a pre-filled WhatsApp message (`wa.me` link) for that
  person — nothing sends automatically, you click send yourself. A "Copy
  text" button is there as a fallback if a number isn't reachable on
  WhatsApp.
- Two editable message templates (men get the ₹599-entry framing, women
  get free-entry framing) and one shared "event line" field that both
  templates pull from — update the date/venue once, not in two places.
- Gated behind a single shared password (see below) — this is meant for
  you, not multi-user admin accounts.

"Contacted" state and your template edits are stored in the browser
(`localStorage`), not a database — they're per-browser, not shared across
devices, and will reset if the site data is cleared.

## 1. One-time setup: share the Google Sheet

The app reads the sheet without any Google API credentials, using its
public CSV export link. For that to work, the sheet needs to be shared as:

**Anyone with the link → Viewer**

(File → Share → General access → "Anyone with the link", role "Viewer".)

This does not make the sheet searchable or public on Google — only
someone with the exact link can open it — but the CSV export URL itself
should be treated as a secret, since anyone with it can read the raw
data. Don't post that URL anywhere public.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` for local testing, and set the same
three variables in your hosting provider's dashboard for production:

- `ADMIN_PASSWORD` — the password you'll type in to log in. Pick something
  real, not the placeholder.
- `SESSION_SECRET` — a random string used to sign the login cookie.
  Generate one with `openssl rand -hex 32`.
- `SHEET_ID` / `SHEET_GID` — identify the sheet and tab. Both come from
  the sheet's URL:
  `https://docs.google.com/spreadsheets/d/SHEET_ID/edit?gid=SHEET_GID`

## 3. Deploy

This is a standard Next.js app — deploy it the same way you're already
deploying the GreenFlag app (Vercel is the path of least resistance since
you're already using it there):

```bash
npm install
vercel deploy   # or connect the repo in the Vercel dashboard
```

Set the three environment variables in the Vercel project settings before
your first production deploy.

## 4. Point the subdomain at it

In Vercel: Project → Settings → Domains → add `admin.musigoevents.com`.
Vercel will show you a CNAME (or A record) to add.

In your DNS provider (wherever musigoevents.com's domain is managed):
add that CNAME record for the `admin` subdomain, pointing at the value
Vercel gives you. Propagation is usually a few minutes, sometimes longer.

Once that's live, `admin.musigoevents.com` will show the password gate,
and after logging in, the outreach dashboard.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

## Notes / limitations

- This sends nothing automatically. Every WhatsApp message still requires
  you to personally hit send in your own WhatsApp — that's intentional,
  not a current limitation to fix.
- If you outgrow manual click-through (say, hundreds of signups a week),
  the next step up would be connecting a WhatsApp Business API provider
  (e.g. Twilio, Gupshup) for real automated sends — that's a separate,
  larger integration and isn't what this app does today.
- The single shared password is appropriate for one person using this.
  If more people need access with individual accounts, that's a different
  auth setup (e.g. a real login system) — worth flagging before it
  becomes a problem.
