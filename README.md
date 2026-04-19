# Rayo Challenge MVP

A production-ready MVP for a daily fitness and apparel challenge built with Next.js, Tailwind CSS, Supabase, and Netlify.

## Product model

This version intentionally removes magic links and formal participant auth.

- Participants join or return with:
  - full name
  - email
  - Instagram handle
- The app stores a simple participant cookie on the current device
- Daily check-ins are attached to that participant record
- Admin access uses a lightweight shared key

This keeps the experience fast and simple for an MVP.

## Features

- Landing page with clear challenge CTA
- Join / return flow using name, email, and Instagram handle
- Participant dashboard with current streak, total check-ins, and latest activity
- Daily photo check-ins with optional captions
- One check-in per participant per local calendar day
- Recent check-in timeline with image thumbnails
- Admin dashboard with user/date filters
- Netlify-ready configuration for App Router deployment

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Supabase Postgres and Storage
- Netlify hosting

## Environment variables

Create `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_ACCESS_KEY=your_shared_admin_access_key
```

## Important note about the service role key

This app performs all Supabase reads, writes, and storage operations on the server using `SUPABASE_SERVICE_ROLE_KEY`.

- Never expose the service role key in the browser
- Keep it only in server environments such as `.env.local` and Netlify environment variables
- Do not prefix it with `NEXT_PUBLIC_`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with the variables above

3. Run the SQL in [supabase/schema.sql](/C:/Users/Tahmid/Documents/Codex/2026-04-20-build-a-production-ready-mvp-web/supabase/schema.sql)

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## How the participant flow works

- On `/join`, a participant enters full name, email, and Instagram handle
- The app creates or updates a row in `profiles`
- An HTTP-only cookie stores that participant's profile id on the current device
- `/dashboard` reads that cookie and loads the participant's check-ins
- "Use different details" clears the participant cookie and returns to `/join`

## How local date handling works

- The dashboard check-in form computes the participant's local date in the browser as `YYYY-MM-DD`
- That date is submitted with the check-in and saved into `check_ins.check_in_date`
- The unique constraint on `(user_id, check_in_date)` prevents duplicate daily submissions
- This is intentionally simple for the MVP and keeps streak logic reliable

## Storage design

- Photos are uploaded to the private `check-in-photos` bucket
- The database stores the storage object path in `photo_url`
- The app generates signed URLs on the server when rendering participant and admin views

## Admin access

- Visit `/admin`
- Enter the shared `ADMIN_ACCESS_KEY`
- The app stores a lightweight admin cookie and opens the dashboard

This is intentionally simple protection, not enterprise-grade auth.

## Netlify deployment

1. Push this repo to GitHub, GitLab, or Bitbucket
2. Create a new Netlify site from the repo
3. Add environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_ACCESS_KEY`
4. Deploy

The included [netlify.toml](/C:/Users/Tahmid/Documents/Codex/2026-04-20-build-a-production-ready-mvp-web/netlify.toml) keeps the build settings explicit.

## Key routes

- `/` landing page
- `/join` participant entry page
- `/dashboard` participant dashboard
- `/admin` admin dashboard

## Notes

- This build intentionally does not use Supabase Auth or magic links
- The current streak is recalculated from recorded check-in dates rather than stored separately
- Because the app uses a simple participant cookie, changing devices means re-entering the same identity details
