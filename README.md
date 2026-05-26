# Nabla

**Open-source education platform for students and instructors (K–college)**

Nabla lets anyone upload course materials and instantly build custom courses with the help of AI(in progress). Nabla also provides student tools such as AI-generated study notes and practice questions. Nabla's goal is to open-source education which means courses, notes, and questions can be shared to a community library. This creats a growing resource of peer-contributed curriculum which can be used when building new curriculum by users.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)

---

## Overview

Nabla has two user roles:

- **Students** — upload documents, generate study notes and practice questions, browse the community library, and track their learning.
- **Instructors** — everything students can do, plus an instructor workspace for managing classes and assignments (in progress).

All users start as students. Instructors get an additional dashboard workspace — no mode switching required.

---

## Features

### AI notes pipeline

- Upload **PDF or TXT** files (up to 10 MB per file, 25 MB per batch)
- Configurable question generation: **MCQ**, **True/False**, **Free Response**, and **Flashcards** (0–20 of each type)
- Tag notes by subject, subtopic, and level band before processing
- AI produces a structured markdown summary organized by topic, plus typed question objects stored as JSON
- Full **LaTeX math rendering** via KaTeX — formulas in both notes and questions display correctly

### Notes workspace (`/notes`)

| Tab             | Description                                               |
| --------------- | --------------------------------------------------------- |
| All Notes       | Grid of your note sets; click any card to open the viewer |
| By Topic        | Notes grouped by subject accordion                        |
| My Public Notes | Filtered view of your notes you have made public          |

### Note viewer

- Full markdown rendered with GFM and KaTeX
- Questions tab organized by type — MCQ with highlighted correct answers, T/F, FRQ with sample answer, interactive flip-card flashcards
- **Public/private toggle** on the note set (cascades to all questions) or per individual question, with a confirmation dialog before any change
- Download note as `.md` file

### Community library (`/library`)

- All note sets and questions marked public by any user appear here
- Cards show the author's name and creation date
- Read-only viewer: no visibility controls, no download

### Authentication & onboarding

- Email sign-up with student or instructor role selection
- Supabase Auth with SSR cookie sessions and middleware-enforced route protection
- Instructor accounts see an additional workspace panel on the dashboard

### Dashboard

- Personalized greeting
- **Instructor workspace** (visible to instructors only) — placeholders for classes, assignments, and grade queue
- **Your workspace** — quick links to the study library and notes

### Curriculum browser (`/learn`)

- Topic taxonomy: subject → subtopic → level band → content
- Structured content blocks (in progress)

---

## Tech stack

| Layer                 | Technology                                                   |
| --------------------- | ------------------------------------------------------------ |
| **Framework**         | Next.js 15 — App Router, React Server Components, TypeScript |
| **Styling**           | Tailwind CSS v4                                              |
| **Database**          | Supabase - Postgres                                          |
| **Auth**              | Supabase Auth via `@supabase/ssr` (SSR cookie sessions)      |
| **File storage**      | Supabase Storage — private bucket                            |
| **AI**                | Vercel AI SDK + Groq (`openai/gpt-oss-120b`)                 |
| **PDF parsing**       | `pdf-parse` v1                                               |
| **Math rendering**    | `remark-math` + `rehype-katex` + KaTeX CSS                   |
| **Markdown**          | `react-markdown` + `remark-gfm`                              |
| **Schema validation** | Zod v4 — AI output validated at runtime                      |
| **Deployment**        | Vercel                                                       |

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── notes/
│   │   │   ├── upload/           POST — AI pipeline (extract → generate → store)
│   │   │   ├── [noteSetId]/      GET — fetch note set + questions + markdown
│   │   │   │   ├── download/     GET — stream .md file
│   │   │   │   └── visibility/   PATCH — toggle note set public/private (cascades)
│   │   │   ├── questions/
│   │   │   │   └── [questionId]/visibility/  PATCH — toggle single question
│   │   │   └── public/[noteSetId]/  GET — public read (no ownership check)
│   │   └── courses/view/         POST — record course view
│   ├── dashboard/                Student + instructor dashboard
│   ├── library/                  Community public library
│   ├── notes/
│   │   ├── all_notes/            All user notes grid
│   │   ├── notes_by_topic/       Notes grouped by topic accordion
│   │   ├── my_public_notes/      User's own public notes
│   │   └── [noteSetId]/          Redirect → all_notes?open=<id>
│   ├── learn/                    Curriculum browser
│   ├── onboarding/               Role selection wizard
│   ├── signup/ login/            Auth pages
│   └── auth/signout/             Sign-out handler
├── components/
│   ├── dashboard/
│   │   ├── GreetingWidget.tsx
│   │   ├── InstructorWorkspaceWidget.tsx
│   │   └── QuickLinksWidget.tsx
│   ├── notes/
│   │   ├── NoteViewerModal.tsx   Full-screen viewer (owned + public variants)
│   │   ├── NoteSetCard.tsx       Preview card (supports authorName for public)
│   │   ├── NotesGrid.tsx         Card grid with upload trigger
│   │   ├── NotesTopicAccordion.tsx
│   │   ├── PublicLibraryGrid.tsx Read-only public grid
│   │   ├── UploadModal.tsx       2-step upload wizard
│   │   └── AddNoteCard.tsx
│   └── ui/                       Button, Logo, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts             Browser Supabase client
│   │   ├── server.ts             RSC / route handler client
│   │   ├── service.ts            Service role client (bypasses RLS)
│   │   └── middleware.ts         Session refresh helper
│   ├── notes/
│   │   ├── ai.ts                 Groq model config
│   │   ├── extract.ts            PDF + TXT text extraction
│   │   ├── math.ts               LaTeX delimiter normalizer
│   │   ├── mock.ts               Mock AI output (USE_MOCK_AI=true)
│   │   └── prompt.ts             System + user prompt builder
│   ├── curriculum/taxonomy.ts    Subject tree definition
│   └── onboarding.ts             Role → profile metadata helpers
├── types/
│   ├── notes.ts                  Zod schemas + TS types for all question types
│   └── curriculum.ts             Taxonomy types
└── middleware.ts                 Auth guard + session refresh
supabase/
└── migrations/                   Ordered SQL migrations (001 → 008)
```
