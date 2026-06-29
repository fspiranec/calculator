# Clean Macro Tracker

Clean Macro Tracker is a fast, mobile-first calorie, macro, weight, and progress tracking web app with required Supabase accounts. It stores private food diary entries, custom foods, goals, body weight logs, and calculator settings in Supabase Postgres with Row Level Security.

## Features

- First-run onboarding for daily calorie, protein, carbs, and fat goals
- Calendar/day picker with previous and next day navigation
- Daily macro totals, remaining targets, progress bars, and meal entries
- Food logging from a searchable starter clean-food database
- Manual macro entry for meals with known nutrition values
- Meal grouping: Breakfast, Lunch, Dinner, Snack, and Other
- Edit, delete, duplicate entries, and copy yesterday's meals
- Custom foods saved to private Supabase rows
- Daily body weight tracking with optional notes
- Progress page with weight statistics, period filters, and mobile-readable line chart
- BMI calculator that can use latest recorded weight
- Calorie Needs calculator with Mifflin-St Jeor BMR/TDEE and target macro recommendations
- Export backup, Import backup, Reset all data, and Storage info controls
- Required Supabase email/password login and optional Google OAuth for cross-device sync

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React client components
- Supabase Auth and Postgres as the source of truth; browser storage is only a temporary cache/offline implementation detail
- Deployable to Vercel

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Push to GitHub

```bash
git add .
git commit -m "Update Clean Macro Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clean-macro-tracker.git
git push -u origin main
```

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the default Next.js settings. This repo also includes `vercel.json` to force the Next.js framework preset and `.next` output directory, which prevents static-site output directory mistakes such as looking for `public` after build.
5. Click **Deploy**.


## Supabase account setup

Clean Macro Tracker now requires login. Food entries, custom foods, goals, profile settings, and weight entries are stored in private Supabase rows so the same account can restore data on another browser/device. Export/import backup remains available for the logged-in user.

### Supabase setup

1. Create a Supabase project.
2. Copy the Project URL and anon public key from **Project Settings → API**. Never use the service role key in the browser.
3. Add `.env.local` using the Supabase **Project URL** and the full **Publishable / anon** key. The repo includes your project defaults, but explicit env vars are still recommended for Vercel and local development. Do not use the REST API URL ending in `/rest/v1/`, and never paste a secret/service-role key into frontend env vars. This project includes `.env.example` with the provided project URL:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sijwbahfnmakitnrrkzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpandiYWhmbm1ha2l0bnJya3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MDQzOTMsImV4cCI6MjA5ODI4MDM5M30.bdcNa3bXwo9YJywIK0w1ruUZl4ygU-1BbeYVZztEwDQ
```

4. Open the Supabase SQL editor and run `supabase/migrations/001_initial_schema.sql` to create the database tables, constraints, triggers, and RLS policies.
5. Enable email/password auth in Supabase Auth settings.
6. Add the same two environment variables in Vercel Project Settings: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
7. Deploy to Vercel.
8. Test signup, login, sync, logout, and restore in a second browser.


### Running the SQL migration correctly

In Supabase SQL Editor, paste only the raw SQL from `supabase/migrations/001_initial_schema.sql`. Do **not** paste a GitHub diff or patch. If the first line starts with `diff --git`, `---`, `+++`, or `@@`, it is not valid SQL and Supabase will throw `syntax error at or near "diff"`. If Supabase reports a syntax error on a column name, re-copy the raw file because rendered line numbers or a missing comma from a partial copy can corrupt SQL. Use GitHub's **Raw** view or copy the file contents from your editor. The first line should be:

```sql
create extension if not exists pgcrypto;
```

All user-owned cloud tables have Row Level Security policies so users can only access rows where `user_id = auth.uid()`; `profiles` rows are restricted by `id = auth.uid()`. Clearing browser data does not delete Supabase data; logging in again restores the account data from the cloud database.


### Login redirects back to login

The browser client uses `@supabase/ssr` `createBrowserClient` so Supabase writes auth cookies that the middleware can read. If login appears to do nothing after deployment, clear old site cookies/local storage, redeploy, then try again. Also confirm Email/Password auth is enabled and, if email confirmations are required, confirm the user email before logging in.

### Auth and data behavior

Opening `/` redirects to `/dashboard`, and protected dashboard routes redirect unauthenticated users to `/login`. Signup/login uses Supabase Auth. The dashboard loads the authenticated user’s goals, custom foods, food entries and weight entries from Supabase, then writes changes back to user-owned rows using the authenticated user id.

## Backup format

Exports contain one JSON object with `version`, `exportedAt`, `source`, `goals`, `userProfile`, `customFoods`, `foodEntries`, `weightEntries`, and `syncMetadata`.

## Limitations

- Supabase configuration is required for the app dashboard.
- Browser storage is not the source of truth; Supabase user-owned rows are.
- Deleting local browser data does not delete Supabase data.
- Nutrition values are approximate starter values and should be edited or replaced with brand-specific values when needed.

## Future features

- Deeper cloud conflict review UI
- Barcode scanner
- AI photo meal recognition
- Weekly reports
- Weight tracking enhancements
- Meal templates
- Recipe builder
