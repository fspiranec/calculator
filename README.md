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
- No login, no backend, and no fake cloud service

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

## Backup format

Exports contain one JSON object with `version`, `exportedAt`, `goals`, `userProfile`, `customFoods`, `foodEntries`, and `weightEntries`.

## Limitations

- Data is saved only in the current device/browser using IndexedDB.
- There is no account system and no cloud sync in this MVP.
- Data can be removed if the user clears browser/site data, uses private browsing, changes device/browser, or resets the app.
- Nutrition values are approximate starter values and should be edited or replaced with brand-specific values when needed.

## Future features

- Login and cloud sync with Supabase
- Barcode scanner
- AI photo meal recognition
- Weekly reports
- Weight tracking enhancements
- Meal templates
- Recipe builder
