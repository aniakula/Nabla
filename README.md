# Nabla

Open education platform — see [plan.md](./plan.md) for the full roadmap.

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL in `supabase/migrations/001_profiles.sql` in the SQL Editor
   - Under **Authentication → Providers**, enable Email
   - Copy project URL and anon key into `.env.local` (see `.env.local.example`)

3. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Flow

1. **Landing** (`/`) → **Get started** → `/onboarding`
2. Choose **Student** or **Instructor**
3. **Sign up** (`/signup`) — role is stored and written to `profiles` on registration
4. **Dashboard** (`/dashboard`) — placeholder after login

## Stack

- Next.js 15 (App Router) + Tailwind CSS v4
- Supabase Auth + Postgres
- Deploy: Vercel + Supabase
