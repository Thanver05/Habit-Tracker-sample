# Little by Little — Habit Tracker

A small habit tracker built with Next.js, React, TypeScript, and Supabase Auth. It carries forward the original `index.html` design and features: add habits, mark them complete for today, see daily progress and streaks, and remove habits. Signed-in users' data is stored in Supabase and protected with Row Level Security.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

1. Install packages:

   ```powershell
   npm install
   ```

2. Copy the environment example:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Set `NEXT_PUBLIC_SUPABASE_URL` and a public key in `.env.local`. Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` when available. Older self-hosted installations can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead. Never put a `service_role` or secret key in a `NEXT_PUBLIC_` variable.

4. In Supabase Studio, open **SQL Editor** and run the SQL in `supabase/migrations/20261015000000_habit_tracker.sql`.

5. Start the app:

   ```powershell
   npm run dev
   ```

   Open <http://localhost:3000>.

## Supabase Auth settings

In Supabase Auth URL configuration, set the local Site URL to `http://localhost:3000` and allow `http://localhost:3000/auth/callback`. Add the production app URL and callback there when you deploy. Email confirmation and password reset need working SMTP settings on a production self-hosted instance.

The app uses cookie-based sessions through `@supabase/ssr`. The migration enables RLS and limits habits and completions to their owning account. The app does not need a Supabase service-role key.

## Deploy with Coolify

Connect this Git repository to Coolify as a Next.js application. Set the Supabase URL and public key as build/runtime environment variables before deploying. The browser must be able to reach the Supabase URL over HTTPS. Supabase itself should be deployed as a separate Coolify Service.