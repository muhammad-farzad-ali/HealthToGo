# HealthToGo - Wellness PWA

## Goal

Build a comprehensive local-first wellness PWA with:
- Nutrition tracking (macros, micronutrients)
- Exercise & steps tracking
- Physiological metrics (heart rate, weight, blood pressure, etc.)
- Mood/Wellbeing tracking (mood, stress, energy, journal)
- Bowel movement tracking (Bristol Scale)
- Data sovereignty (offline-first, JSON import/export)
- PWA with offline capabilities
- Multi-profile support with common shared inventory

## Instructions

- Use React + TypeScript + Vite
- Use shadcn/ui components (no custom components)
- Use Dexie.js for IndexedDB storage
- Use Recharts for data visualization
- Use vite-plugin-pwa for offline capabilities
- Keep all data local (no cloud APIs)
- Deploy to GitHub Pages at `https://muhammad-farzad-ali.github.io/HealthToGo/`

## Discoveries

- Dexie schema needs version increments when making changes
- PWA needs `scope` and `start_url` configured for GitHub Pages subdirectory deployment
- GitHub Pages deployment requires using `gh-pages` branch, not main branch
- For subdirectory deployment, vite config needs `base: '/HealthToGo/'`
- Wellbeing metrics (mood, stress, energy) use 1-10 scale
- Bowel movements tracked using Bristol Scale (1-7)
- Profile initialization had a race condition that needed fixing with useRef

## Accomplished

✅ Project initialization (Vite + React + TypeScript)
✅ shadcn/ui setup with Tailwind CSS
✅ Dexie.js database with proper schema (v3 with profiles)
✅ PWA configuration with proper scope/start_url
✅ Food & Workout Inventory CRUD
✅ Daily Log with nutrition, exercise, sleep, hydration, steps
✅ Dashboard with progress rings and trend charts
✅ Custom targets & custom metrics
✅ Data backup/restore & inventory sharing
✅ Expanded nutrition (kJ, saturated fat, fiber, sugars)
✅ Automatic step calorie calculation
✅ Physiological metrics tracking
✅ Mood/Stress/Energy tracking with journal
✅ Bowel movement tracking (Bristol scale)
✅ Profile management (add/switch/delete profiles)
✅ Shared inventory across profiles
✅ Sample data seeding (10 foods, 8 workouts, 14 days demo data)
✅ Factory reset functionality
✅ GitHub Pages deployment with PWA manifest

## Relevant Files / Directories

- `.github/workflows/deploy.yml` - GitHub Actions workflow for deployment
- `vite.config.ts` - Vite + PWA configuration with base path
- `public/pwa-192x192.svg` - PWA icon 192x192
- `public/pwa-512x512.svg` - PWA icon 512x512
- `src/lib/types.ts` - TypeScript interfaces (Profile, DailyLog, UserSettings, etc.)
- `src/lib/db.ts` - Dexie database configuration, seed data, factory reset
- `src/hooks/useProfile.tsx` - Profile context and hooks
- `src/App.tsx` - Main app with profile selector UI
- `src/components/daily-log/DailyLogPage.tsx` - Main daily logging interface
- `src/components/dashboard/Dashboard.tsx` - Dashboard with progress rings, sleep/bowel/wellbeing sections
- `src/components/settings/SettingsPage.tsx` - Target settings
- `src/components/settings/DataTools.tsx` - Backup/restore, demo data, factory reset

## Current Status

The PWA is deployed and working at `https://muhammad-farzad-ali.github.io/HealthToGo/`. The manifest was just updated to include `scope: '/HealthToGo/'` to fix the installation URL issue. User may need to clear browser cache or reinstall the PWA.
