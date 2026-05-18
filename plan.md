# Nabla — Product & Implementation Plan

> Reference document for building Nabla. Do not treat as user-facing docs.
> Last updated from planning sessions (stack: Vercel + Supabase + Next.js).

---

## Table of contents

1. [Product summary](#1-product-summary)
2. [Confirmed product decisions](#2-confirmed-product-decisions)
3. [Tech stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Information architecture & data model](#5-information-architecture--data-model)
6. [Auth, roles & onboarding](#6-auth-roles--onboarding)
7. [Libraries & access control](#7-libraries--access-control)
8. [Content pipeline (upload & publish)](#8-content-pipeline-upload--publish)
9. [Grading](#9-grading)
10. [Classes & assignments](#10-classes--assignments)
11. [Tutoring](#11-tutoring)
12. [Payments](#12-payments)
13. [Compliance (K–college)](#13-compliance-kcollege)
14. [Testing & development (no Docker)](#14-testing--development-no-docker)
15. [Repository layout](#15-repository-layout)
16. [Environment variables](#16-environment-variables)
17. [Implementation phases & steps](#17-implementation-phases--steps)
18. [Open decisions](#18-open-decisions)
19. [Scaling path](#19-scaling-path)

---

## 1. Product summary

Nabla is an education platform for **students and instructors** (K–college) focused on **open-sourcing education**.

| Pillar | Description |
|--------|-------------|
| **Structured curriculum** | Genres (Math, Science) → subtopics (Algebra 1, Pre-calc) → units → ordered content (readings, diagrams, animations, practice) |
| **Base library** | Free curated/dummy curriculum for all users |
| **Open library** | Community-contributed content; premium subscription for full access |
| **Classroom** | Instructors manage multiple classes, rosters, assignments from libraries |
| **Contribution** | Upload PDFs/screenshots or create content in-app; AI transforms to schema and publishes |
| **Tutoring** | Tutor discovery via search/filter; no in-platform video/sessions (third-party) |
| **Monetization** | Free base library; paid open library; tutor marketplace commission (later); enterprise later |

---

## 2. Confirmed product decisions

| Area | Decision |
|------|----------|
| **Audience** | K–college |
| **Accounts** | One email per user. Everyone is a student. Instructors have a **toggle** between student mode and instructor mode. All instructors retain full student capabilities. |
| **Email** | Any email; no institutional email requirement |
| **Taxonomy** | **Genre** → **Subtopic** → **Unit** → ordered **content blocks**. Tree is **admin-only** (static for users; team expands over time) |
| **Levels** | “Levels” are subtopics under a genre (e.g. Algebra 1, Pre-calc under Math)—not a separate global entity |
| **Seed content** | Dummy content per unit for now; real seeding later |
| **Open library moderation** | AI transform → quick AI screen → **publish immediately**. Flag as open-source. **Community ratings** drive quality; light moderation (report/hide tools for abuse) |
| **Upload permissions** | Students and instructors can upload |
| **Open library visibility (free)** | Users see **only their own** uploads in the open library (+ full base library) |
| **Open library visibility (premium)** | Full public open library |
| **Attribution** | Required on contributed content |
| **Class size** | No maximum |
| **Grading (async/seeded curriculum)** | Auto-grade MCQ; **AI-grade FRQ** |
| **Grading (instructor/tutor assignments)** | MCQ auto-grade when instructor sets answer key; FRQ and others **manual** by instructor |
| **LMS integration** | Not in v1 |
| **Tutoring** | Student **picks** tutor; search/filter by topic, rating, etc. |
| **Sessions / video** | **Not on platform**; third-party as agreed by student and tutor |
| **Session length** | Not managed on platform |
| **Platform commission (tutors)** | **10%** when tutor payments are implemented |
| **Enterprise** | Deferred |
| **Region (payments/tax)** | **US only** for v1 |
| **Client** | **Web only** |
| **Offline** | Deferred |
| **White-label / multi-tenant** | Deferred |

---

## 3. Tech stack

No Docker required. Develop locally with `npm run dev` against a hosted Supabase dev project.

| Layer | Technology |
|-------|------------|
| **Frontend** | **Next.js 14+** (React, App Router, TypeScript) |
| **Hosting** | **Vercel** (Hobby free tier for dev/preview; Pro when needed) |
| **Backend** | **Vercel Route Handlers** (`app/api/**/route.ts`) + Server Actions where appropriate |
| **Database** | **Supabase Postgres** |
| **Auth** | **Supabase Auth** (`@supabase/ssr` for cookies in Next.js) |
| **File storage** | **Supabase Storage** (uploads, published media) |
| **Payments** | **Stripe** (Billing for subscriptions; Connect for tutor payouts when live) |
| **AI** | OpenAI and/or Anthropic (server-side only, via API routes) |
| **Background jobs** | Vercel Cron + job table, or **Inngest** / **Trigger.dev** when AI pipeline needs async (avoid long single requests) |
| **E2E tests** | Playwright against `localhost` or Vercel preview |
| **CI** | GitHub Actions: lint, typecheck, tests (no AWS/Docker required) |

**Why Next.js (not Vite SPA):** Vercel API routes, SSR session cookies, and one deploy align with this stack.

---

## 4. Architecture

```
Browser
   │
   ▼
┌─────────────────────────────────────┐
│  Vercel — Next.js App               │
│  • Pages / App Router UI            │
│  • Route Handlers /api/*            │
│  • middleware.ts (auth, onboarding) │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┬─────────────┬──────────────┐
     ▼           ▼             ▼              ▼
 Supabase    Supabase      Supabase       Stripe / AI APIs
 Auth        Postgres      Storage        (webhooks → API routes)
             + RLS
```

**Responsibility split**

| Concern | Where |
|---------|--------|
| Sign up, login, OAuth, sessions | Supabase Auth + `@supabase/ssr` |
| Data & authorization | Postgres + **RLS**; complex logic in API routes with service role after `getUser()` |
| Raw uploads | Supabase Storage |
| AI transform, Stripe webhooks, admin | Vercel API routes (service role key server-only) |
| Premium / own-uploads-only rules | RLS + API validation |

---

## 5. Information architecture & data model

### Taxonomy (admin-defined)

```
Genre (Math, Science, …)
  └── Subtopic (Algebra 1, Pre-calc, Calc, …)
        └── Unit 1, Unit 2, …
              └── Content blocks (ordered)
```

Users **cannot** modify the taxonomy tree.

### Content block types

`reading` | `diagram` | `animation` | `question_mcq` | `question_frq` | `media`

### Library types

| Library | Access |
|---------|--------|
| `base` | Free for all authenticated users |
| `open` | Community-published; see [Libraries & access control](#7-libraries--access-control) |

### Core tables (conceptual)

- `profiles` — extends `auth.users` (roles, mode, subscription, onboarding)
- `genres`, `subtopics`, `units` — taxonomy
- `content_blocks` — ordered blocks per unit; `library`, `contributor_id`, `published`, ratings aggregate
- `contributions` — upload/processing pipeline state
- `ratings` — user ratings on published open content
- `classes`, `enrollments` — classroom
- `assignments`, `submissions` — assigned work and grading
- `tutor_profiles`, `tutor_subjects` — tutor discovery
- `tutor_student_links` — optional link for assigning work off-platform
- `processing_jobs` — async AI pipeline
- `billing` / Stripe IDs on `profiles` — subscriptions

### Content block JSON schema

Shared TypeScript types in `types/curriculum.ts` (frontend + API).

---

## 6. Auth, roles & onboarding

### Profile fields (key)

```sql
profiles (
  id uuid PK references auth.users,
  display_name text,
  is_instructor boolean default false,
  active_mode text check (active_mode in ('student', 'instructor')),
  subscription_tier text,  -- 'free' | 'open_library' | 'enterprise'
  onboarding_completed boolean default false,
  age_band text,           -- pending COPPA decision
  stripe_customer_id text,
  ...
)
```

### Onboarding flow

1. Sign up / log in (Supabase Auth)
2. Who are you? → Student / Instructor / Both
3. Student: grade band, subjects of interest
4. Instructor: display name, subjects taught; optional “available as tutor”
5. Both: combined steps
6. Set `onboarding_completed = true`

Redirect users with incomplete onboarding away from `/app/*` to `/onboarding`.

### Instructor toggle

- API: `PATCH /api/profile/mode` → updates `active_mode`
- UI: show instructor navigation only when `is_instructor` AND `active_mode = 'instructor'`
- All instructors always have student capabilities in student mode

### Middleware

- Refresh Supabase session
- Enforce auth on protected routes
- Enforce onboarding completion
- Optional: gate premium routes

---

## 7. Libraries & access control

### Rules

| User tier | Base library | Open library |
|-----------|--------------|--------------|
| **Free** | Full read | **Own uploads only** (published) |
| **Premium (`open_library`)** | Full read | **Full public** open library |
| **Enterprise** | Full read | Full + enterprise features (later) |

### RLS policy summary

| Resource | Policy |
|----------|--------|
| Base units/blocks | `library = 'base'` AND published → SELECT for authenticated |
| Open library (premium) | `library = 'open'` AND published → SELECT if subscription tier allows |
| Open library (free) | `library = 'open'` → SELECT only if `contributor_id = auth.uid()` |
| Taxonomy | SELECT all; INSERT/UPDATE service role / admin only |
| Class data | SELECT if instructor of class or enrolled student |
| Uploads (Storage) | User can write/read own paths; public media bucket for published assets |

Complex grading and admin actions: **service role in API routes** after verifying user JWT.

---

## 8. Content pipeline (upload & publish)

### Flow

```
Upload (PDF/image) or in-app editor save
  → Store raw file in Supabase Storage
  → Insert contribution (status: processing)
  → Async job: extract text / OCR → AI map to ContentBlock[] → AI safety screen
  → Publish immediately (status: published, library: open, opensource flag)
  → Attribution + contributor_id stored
  → Community can rate; ratings affect sort/recommendations
```

### Implementation notes

- Do **not** run full PDF + LLM in one synchronous API request (Vercel timeout ~10s on Hobby)
- Use job table + Vercel Cron or Inngest/Trigger.dev
- Dev: `USE_MOCK_AI=true` with fixture JSON to avoid API costs
- Keep admin `reported` / `hidden` flags for abuse

### In-app authoring (parallel)

- Rich text (TipTap or Lexical), diagram embed (Excalidraw/tldraw), question builder
- Same publish pipeline as uploads

### Attribution & license

- Store `contributor_id`, `display_name`, `attribution_text`, `license_note`
- Default license text: **TBD** (see Open decisions)

---

## 9. Grading

| Source | MCQ | FRQ / other |
|--------|-----|-------------|
| **Seeded / async curriculum** (base + open units) | Auto-grade | **AI rubric grade** (+ store model version for disputes) |
| **Class / tutor assignment** | Auto if instructor set answer key | **Manual** by instructor |

Single grading service with strategies: `auto_mcq`, `ai_frq`, `manual_frq`.

---

## 10. Classes & assignments

### Features

- Instructor creates multiple **classes** (no max students)
- Students join via **invite link and/or class code** (TBD which)
- Instructor assigns units or question sets from base/open library
- Student dashboard: classes → assignments → submit
- Instructor dashboard: roster, assignment completion, manual grading queue

### Tables

`classes`, `enrollments`, `assignments`, `assignment_items`, `submissions`

---

## 11. Tutoring

### In scope (v1)

- Tutor profile: subjects/subtopics, bio, rate (for future payments), availability text
- **Search** with filters: topic, subtopic, rating, price
- Student **browses and picks** a tutor
- Optional tutor–student link for assignments on platform
- **No** in-app video, session length, or calendar

### Out of scope (v1)

- Video calls, session scheduling on platform
- In-platform session payments (unless added as simple booking fee later)

### Communication (TBD)

In-app messaging vs email reveal vs external only — see Open decisions.

---

## 12. Payments

**Provider:** Stripe (US only v1). Use **test mode** for all development ($0).

### Revenue lines

| Line | Implementation | Status |
|------|----------------|--------|
| **Open library subscription** | Stripe Billing + Customer Portal; webhook updates `subscription_tier` | v1 |
| **Tutor sessions** | Stripe Connect; **10%** platform fee | When tutor payments ship |
| **Enterprise** | Stripe Invoices + manual seat provisioning | Later |

### Webhook

`POST /app/api/webhooks/stripe/route.ts` — verify signature, idempotent event handling, update `profiles.subscription_tier`.

### Gating

API + RLS + UI hide open library content for non-premium (except own uploads).

**Subscription price:** TBD.

---

## 13. Compliance (K–college)

- Spanning K–12 and college may require **COPPA** handling for under-13
- Options: parent consent flow vs **minimum age 13** for v1 — **TBD**
- Collect `age_band` or date of birth at onboarding — **TBD**
- FERPA matters more for future school/enterprise deals
- Terms: contributor grants license to host/display; attribution required

---

## 14. Testing & development (no Docker)

### Local workflow

1. Create a **Supabase free project** (dev)
2. Run SQL migrations via Supabase SQL editor or `supabase db push` (CLI to remote; no local Docker stack)
3. Copy env vars to `.env.local`
4. `npm run dev` → Next.js hits remote Supabase dev DB
5. Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Free tiers

| Service | Dev cost |
|---------|----------|
| Vercel Hobby | $0 |
| Supabase Free | $0 (limits on DB size, MAU, storage) |
| Supabase Auth | Included |
| Stripe Test Mode | $0 |
| Clerk | N/A (using Supabase Auth) |

### Testing layers

| Layer | Tool |
|-------|------|
| Unit / component | Vitest + React Testing Library |
| API | Integration tests against Supabase dev + test users |
| E2E | Playwright: login → onboarding → browse topic → instructor toggle → class flow |
| Preview deploy | Vercel preview URL per PR |

### Optional

- Second Supabase project for staging
- `USE_MOCK_AI=true` for pipeline tests without LLM spend

---

## 15. Repository layout

```
app/
  (marketing)/
  (auth)/login, signup/
  onboarding/
  topics/[genre]/[subtopic]/[unit]/
  library/
  classes/
  contribute/
  tutor/
  settings/billing/
  api/
    webhooks/stripe/route.ts
    onboarding/route.ts
    profile/mode/route.ts
    upload/route.ts
    content/process/route.ts
    ...
components/
  curriculum/       # block renderers
  classroom/
  tutor/
lib/
  supabase/
    client.ts       # browser
    server.ts       # RSC + route handlers
    middleware.ts
  stripe.ts
  grading/
types/
  curriculum.ts
supabase/
  migrations/       # schema + RLS
```

**ORM:** Prisma (Supabase pooler URL) **or** Supabase-generated types — pick one at scaffold time.

---

## 16. Environment variables

```bash
# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=

# Server only (Vercel — never expose to client)
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY=              # and/or ANTHROPIC_API_KEY
USE_MOCK_AI=false            # true in dev/tests when needed
```

---

## 17. Implementation phases & steps

Build in order. Each phase ends with something testable on Vercel preview + Supabase dev.

---

### Phase 0 — Foundation

**Goal:** Runnable app, DB schema, deploy pipeline.

| Step | Task |
|------|------|
| 0.1 | Initialize Next.js (App Router, TypeScript, Tailwind, ESLint) |
| 0.2 | Create Supabase project; configure Auth (email + Google optional) |
| 0.3 | Add `supabase/migrations` — `profiles` + trigger on `auth.users` insert |
| 0.4 | Wire `@supabase/ssr` — browser client, server client, `middleware.ts` |
| 0.5 | Set up env vars locally and on Vercel |
| 0.6 | Deploy empty app to Vercel; confirm preview deploys work |
| 0.7 | Add GitHub Actions: lint + typecheck |
| 0.8 | Add shared `types/curriculum.ts` |

**Done when:** User can sign up; `profiles` row exists; protected route redirects unauthenticated users.

---

### Phase 1 — Onboarding & instructor toggle

**Goal:** Complete user setup and role/mode switching.

| Step | Task |
|------|------|
| 1.1 | Onboarding UI wizard (student / instructor / both) |
| 1.2 | `PATCH /api/onboarding` — save steps, set `is_instructor`, `age_band` |
| 1.3 | Middleware: redirect incomplete onboarding to `/onboarding` |
| 1.4 | Instructor mode toggle — `PATCH /api/profile/mode` |
| 1.5 | App shell: nav differs by `active_mode` |
| 1.6 | Playwright: sign up → complete onboarding → toggle instructor mode |

**Done when:** New user lands in student dashboard; instructor can switch modes.

---

### Phase 2 — Taxonomy & curriculum browser (dummy content)

**Goal:** Browse genres → subtopics → units → content blocks.

| Step | Task |
|------|------|
| 2.1 | Migrations: `genres`, `subtopics`, `units`, `content_blocks` |
| 2.2 | RLS: public read for base library taxonomy + content |
| 2.3 | Seed script: Math/Science genres, sample subtopics, units, dummy blocks |
| 2.4 | Pages: `/topics`, `/topics/[genre]`, `/topics/[genre]/[subtopic]`, unit viewer |
| 2.5 | Block renderers: reading, diagram placeholder, animation placeholder, MCQ/FRQ UI |
| 2.6 | Optional: `user_unit_progress` for completion tracking |

**Done when:** Logged-in user browses dummy curriculum end-to-end.

---

### Phase 3 — Classes & assignments

**Goal:** Instructors run classes; students submit work.

| Step | Task |
|------|------|
| 3.1 | Migrations: `classes`, `enrollments`, `assignments`, `submissions` |
| 3.2 | RLS: class visibility for instructor and enrolled students |
| 3.3 | API: create class, generate join code/link, enroll student |
| 3.4 | Instructor UI: class list, roster, create assignment from library |
| 3.5 | Student UI: my classes, assignment list, submission form |
| 3.6 | Grading: `auto_mcq` for assignments with answer keys |
| 3.7 | Grading: `manual_frq` queue for instructor |
| 3.8 | Grading: `ai_frq` for async unit practice (seeded content only) |

**Done when:** Instructor assigns unit; student submits; MCQ auto-graded; FRQ in manual queue.

---

### Phase 4 — Open library: upload, AI pipeline, ratings

**Goal:** Contribute content; premium gating; community ratings.

| Step | Task |
|------|------|
| 4.1 | Supabase Storage buckets: `uploads` (private), `media` (public) |
| 4.2 | Upload UI + `POST /api/upload` (signed URL or server upload) |
| 4.3 | `contributions` + `processing_jobs` tables |
| 4.4 | Async processor: extract → AI schema mapping → AI safety screen → publish |
| 4.5 | `USE_MOCK_AI` path for dev/tests |
| 4.6 | RLS: open library visibility (own uploads vs premium full access) |
| 4.7 | Attribution fields on published content |
| 4.8 | Ratings: submit rating, aggregate score, sort in library browse |
| 4.9 | Report content flow + admin hide |

**Done when:** User uploads PDF; content appears in open library (own view); premium user sees others’ content.

---

### Phase 5 — In-app content authoring

**Goal:** Create readings, diagrams, questions inside the app.

| Step | Task |
|------|------|
| 5.1 | Rich text editor for readings |
| 5.2 | Diagram editor embed (Excalidraw or tldraw) |
| 5.3 | Question builder (MCQ / FRQ) |
| 5.4 | Save draft → same publish pipeline as uploads |
| 5.5 | Tag genre/subtopic on publish (user selects; admin tree unchanged) |

**Done when:** Instructor creates unit content in-app and publishes to open library.

---

### Phase 6 — Stripe subscription (open library)

**Goal:** Monetize full open library access.

| Step | Task |
|------|------|
| 6.1 | Stripe products/prices (test mode) |
| 6.2 | `POST /api/billing/checkout` — Checkout Session |
| 6.3 | Customer Portal link for manage/cancel |
| 6.4 | Webhook: sync `subscription_tier` on `profiles` |
| 6.5 | Billing settings page |
| 6.6 | Verify RLS + UI gates update after subscription |

**Done when:** Test card subscription unlocks full open library.

---

### Phase 7 — Tutor discovery

**Goal:** Find and connect with tutors (no video).

| Step | Task |
|------|------|
| 7.1 | `tutor_profiles`, `tutor_subjects` migrations |
| 7.2 | Onboarding/opt-in: instructor marks “available as tutor” |
| 7.3 | Tutor profile edit page (subjects, bio, rate, availability text) |
| 7.4 | Search API with filters (topic, rating, price) |
| 7.5 | Tutor listing + profile page |
| 7.6 | Student “request contact” or messaging (per Open decisions) |
| 7.7 | Optional: `tutor_student_links` for assignment targeting |

**Done when:** Student searches tutors by subject and opens contact/booking flow (off-platform).

---

### Phase 8 — Tutor payments (deferred sub-phase)

**Goal:** Pay tutors through platform with 10% commission.

| Step | Task |
|------|------|
| 8.1 | Stripe Connect Express onboarding for tutors |
| 8.2 | Payment flow for booking/package (exact product TBD) |
| 8.3 | 10% application fee |
| 8.4 | Payout reporting in tutor dashboard |

**Done when:** Test mode payment splits between tutor and platform.

---

### Phase 9 — Enterprise & polish (later)

| Step | Task |
|------|------|
| 9.1 | Enterprise orgs + bulk seats |
| 9.2 | Admin analytics |
| 9.3 | COPPA/parent flow if required |
| 9.4 | Offline support |
| 9.5 | LMS integrations |

---

## 18. Open decisions

Resolve before or during the relevant phase.

| # | Question | Blocks |
|---|----------|--------|
| 1 | **Under 13:** parent consent flow vs minimum age 13? | Phase 1 onboarding |
| 2 | **Age data:** full DOB vs `age_band` only? | Phase 1 |
| 3 | **AI screen:** block only unsafe/PII, or also low-quality rejects? | Phase 4 |
| 4 | **Open library price** (monthly USD)? | Phase 6 |
| 5 | **Free users:** see open-library catalog metadata (titles/ratings) without content, or fully hidden? | Phase 4 RLS/UI |
| 6 | **Default license** (CC BY, CC BY-SA, custom)? | Phase 4 |
| 7 | **Remix/fork** units by other users? | Phase 4+ |
| 8 | **Instructor toggle:** must switch to instructor mode to manage classes, or always show class admin? | Phase 1/3 UI |
| 9 | **Class join:** invite link, class code, or both? | Phase 3 |
| 10 | **Tutor contact v1:** in-app messaging, email reveal, or external only? | Phase 7 |
| 11 | **Tutor payments in v1** or subscription-only first? | Phase 7 vs 8 |
| 12 | **AI FRQ feedback:** show immediately to student? | Phase 3 |
| 13 | **Next.js confirmed** over Vite SPA? | Phase 0 (assumed yes) |

---

## 19. Scaling path

Same stack, upgrade tiers—no technology migration required.

| Component | Start | Scale |
|-----------|-------|-------|
| **Vercel** | Hobby (free) | Pro — longer timeouts, team features |
| **Supabase** | Free | Pro — larger DB, backups, no pause |
| **Stripe** | Test mode | Live mode |
| **Background jobs** | Vercel Cron | Inngest/Trigger.dev if cron insufficient |

Add **Inngest** or **Trigger.dev** when the AI upload pipeline exceeds serverless time limits—not a stack change.

---

## Quick reference: default recommendations

| Topic | Recommendation |
|-------|----------------|
| Auth | Supabase Auth |
| DB access | RLS for reads; service role in API for complex writes |
| Payments | Stripe Billing + Connect |
| Long jobs | Job table + Cron/Inngest; never block upload API on LLM |
| Dev environment | Hosted Supabase dev project + `npm run dev` |
| Production | Vercel prod + Supabase prod + Stripe live |

---

*End of plan. Update this file as decisions in §18 are resolved.*
