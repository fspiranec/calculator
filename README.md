# Clean Macro Tracker

Clean Macro Tracker is a fast, mobile-first calorie and macro tracking web app built for people who want a simple food diary without creating an account. It tracks daily calories, protein, carbs, and fat with a calendar-based diary and local browser storage.

## Features

- First-run onboarding for daily calorie, protein, carbs, and fat goals
- Calendar/day picker with previous and next day navigation
- Daily macro totals, remaining targets, and progress bars
- Food logging from a searchable starter clean-food database
- Manual macro entry for meals with known nutrition values
- Meal grouping: Breakfast, Lunch, Dinner, Snack, and Other
- Edit, delete, duplicate entries, and copy yesterday's meals
- Custom foods saved locally
- Export JSON, Import JSON, and Reset all data controls
- No login, no backend, and no fake cloud service

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React client components
- localStorage for browser-only persistence
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
git init
git add .
git commit -m "Initial Clean Macro Tracker app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clean-macro-tracker.git
git push -u origin main
```

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the default Next.js settings.
5. Click **Deploy**.

## Limitations

- Data is saved only in the current device/browser using localStorage.
- There is no account system and no cloud sync in this MVP.
- Nutrition values are approximate starter values and should be edited or replaced with brand-specific values when needed.

## Future features

- Login and cloud sync with Supabase
- Barcode scanner
- AI photo meal recognition
- Weekly reports
- Weight tracking
- Meal templates
- Recipe builder
