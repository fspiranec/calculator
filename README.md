# Clean Macro Tracker

Clean Macro Tracker is a fast, mobile-first calorie, macro, weight, and progress tracking web app for people who do not want an account. It stores food diary entries, custom foods, goals, body weight logs, and calculator settings locally in the browser using IndexedDB.

## Features

- First-run onboarding for daily calorie, protein, carbs, and fat goals
- Calendar/day picker with previous and next day navigation
- Daily macro totals, remaining targets, progress bars, and meal entries
- Food logging from a searchable starter clean-food database
- Manual macro entry for meals with known nutrition values
- Meal grouping: Breakfast, Lunch, Dinner, Snack, and Other
- Edit, delete, duplicate entries, and copy yesterday's meals
- Custom foods saved locally
- Daily body weight tracking with optional notes
- Progress page with weight statistics, period filters, and mobile-readable line chart
- BMI calculator that can use latest recorded weight
- Calorie Needs calculator with Mifflin-St Jeor BMR/TDEE and target macro recommendations
- Export backup, Import backup, Reset all data, and Storage info controls
- Optional Supabase email/password login for cloud sync; local-only mode remains fully supported

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React client components
- IndexedDB for browser-only persistence, with migration from the original localStorage MVP key
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


## Optional Supabase cloud sync

Clean Macro Tracker is local-first. Without login, all data stays in IndexedDB on this browser/device and the app can work offline after it has loaded. Login is optional. With login, food entries, custom foods, goals, profile settings, and weight entries can sync to Supabase so the same account can restore data on another browser/device. Export/import backup remains available in both modes.

### Supabase setup

1. Create a Supabase project.
2. Copy the Project URL and anon public key from **Project Settings → API**. Never use the service role key in the browser.
3. Add `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Open the Supabase SQL editor and run `supabase/migrations/001_initial_schema.sql`.
5. Enable email/password auth in Supabase Auth settings.
6. Add the same two environment variables in Vercel Project Settings.
7. Deploy to Vercel.
8. Test signup, login, sync, logout, and restore in a second browser.

All user-owned cloud tables have Row Level Security policies so users can only access rows where `user_id = auth.uid()`; `profiles` rows are restricted by `id = auth.uid()`. Clearing browser data can delete local IndexedDB data, but synced cloud data remains available after logging in again.

### Sync behavior

After login, choose one sync decision: merge local data with cloud data (recommended), replace local data with cloud data, upload local data to cloud, or keep using local only. Local IndexedDB remains the immediate source of UI state. New edits are saved locally first and marked pending; manual **Sync now** uploads/downloads data when Supabase is reachable. If a conflict cannot be safely resolved, the app prefers keeping data rather than silently deleting records.

## Backup format

Exports contain one JSON object with `version`, `exportedAt`, `source`, `goals`, `userProfile`, `customFoods`, `foodEntries`, `weightEntries`, and `syncMetadata`.

## Limitations

- Data is saved only in the current device/browser using IndexedDB.
- Cloud sync is optional and requires Supabase environment variables plus the SQL migration.
- Data can be removed if the user clears browser/site data, uses private browsing, changes device/browser, or resets the app.
- Nutrition values are approximate starter values and should be edited or replaced with brand-specific values when needed.

## Future features

- Deeper cloud conflict review UI
- Barcode scanner
- AI photo meal recognition
- Weekly reports
- Weight tracking enhancements
- Meal templates
- Recipe builder
