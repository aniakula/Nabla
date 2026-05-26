-- Phase 4.5 — My Notes
-- Tables: note_sets, note_questions
-- Run in Supabase SQL Editor or via: supabase db push

-- ---------------------------------------------------------------------------
-- note_sets: one row per upload batch / note generation job
-- ---------------------------------------------------------------------------
create table public.note_sets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  title           text not null,
  topic_slug      text,
  subtopic_slug   text,
  level_band      text,                        -- comma-separated range e.g. 'high_school,advanced'
  markdown_path   text,                        -- Supabase Storage path for generated .md
  status          text not null default 'processing'
                    check (status in ('processing', 'ready', 'failed')),
  is_public       boolean not null default false,
  source_filenames text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index note_sets_user_created_idx
  on public.note_sets (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- note_questions: individual questions belonging to a note set
-- ---------------------------------------------------------------------------
create table public.note_questions (
  id              uuid primary key default gen_random_uuid(),
  note_set_id     uuid not null references public.note_sets (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  type            text not null
                    check (type in ('mcq', 'true_false', 'frq', 'flashcard')),
  question_data   jsonb not null,
  is_public       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index note_questions_note_set_idx
  on public.note_questions (note_set_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.note_sets      enable row level security;
alter table public.note_questions enable row level security;

-- note_sets: users read/manage only their own rows
create policy "Users read own note sets"
  on public.note_sets for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users delete own note sets"
  on public.note_sets for delete
  to authenticated
  using (auth.uid() = user_id);

-- note_questions: users read their own questions
create policy "Users read own note questions"
  on public.note_questions for select
  to authenticated
  using (auth.uid() = user_id);

-- API route uses service role for writes, so no INSERT/UPDATE policies needed
-- for the authenticated role. Grant service_role full access.
grant select, delete on public.note_sets      to authenticated;
grant select         on public.note_questions to authenticated;
grant all            on public.note_sets      to postgres, service_role;
grant all            on public.note_questions to postgres, service_role;

-- ---------------------------------------------------------------------------
-- Storage buckets (run separately or add via Supabase Dashboard → Storage)
-- ---------------------------------------------------------------------------
-- Bucket: note-markdown  (private; user reads via signed URL or service role)
-- insert into storage.buckets (id, name, public) values ('note-markdown', 'note-markdown', false)
-- on conflict do nothing;
