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
