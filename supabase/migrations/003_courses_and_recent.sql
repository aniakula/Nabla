-- Courses catalog + per-user recent views (subsection-level navigable paths)
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- courses: canonical row per browsable subsection (topic + level + subsection)
-- Aligns with static taxonomy now; later add subtopic_id FK when genres live in DB
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  topic_slug text not null,
  level_band text not null check (
    level_band in ('elementary', 'middle_school', 'high_school', 'advanced')
  ),
  subsection_slug text not null,
  title text not null,
  description text,
  topic_name text not null,
  topic_emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_taxonomy_path_unique unique (topic_slug, level_band, subsection_slug)
);

create index courses_topic_level_idx
  on public.courses (topic_slug, level_band);

-- ---------------------------------------------------------------------------
-- user_recent_courses: one row per (user, course); UPSERT on each view
-- Dashboard reads ORDER BY last_viewed_at DESC LIMIT N (index supports this)
-- ---------------------------------------------------------------------------
create table public.user_recent_courses (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  last_viewed_at timestamptz not null default now(),
  view_count integer not null default 1 check (view_count > 0),
  primary key (user_id, course_id)
);

create index user_recent_courses_user_last_viewed_idx
  on public.user_recent_courses (user_id, last_viewed_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.courses enable row level security;
alter table public.user_recent_courses enable row level security;

create policy "Authenticated users can read courses"
  on public.courses for select
  to authenticated
  using (true);

create policy "Users read own recent courses"
  on public.user_recent_courses for select
  to authenticated
  using (auth.uid() = user_id);

-- Writes go through security definer RPCs below

-- ---------------------------------------------------------------------------
-- RPC: upsert catalog row + bump recent queue in one round trip
-- ---------------------------------------------------------------------------
create or replace function public.record_subsection_view(
  p_topic_slug text,
  p_level_band text,
  p_subsection_slug text,
  p_title text,
  p_description text default null,
  p_topic_name text default null,
  p_topic_emoji text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_course_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.courses (
    topic_slug,
    level_band,
    subsection_slug,
    title,
    description,
    topic_name,
    topic_emoji
  )
  values (
    p_topic_slug,
    p_level_band,
    p_subsection_slug,
    p_title,
    p_description,
    coalesce(p_topic_name, p_topic_slug),
    p_topic_emoji
  )
  on conflict (topic_slug, level_band, subsection_slug) do update set
    title = excluded.title,
    description = coalesce(excluded.description, public.courses.description),
    topic_name = coalesce(excluded.topic_name, public.courses.topic_name),
    topic_emoji = coalesce(excluded.topic_emoji, public.courses.topic_emoji),
    updated_at = now()
  returning id into v_course_id;

  insert into public.user_recent_courses (user_id, course_id, last_viewed_at, view_count)
  values (v_user_id, v_course_id, now(), 1)
  on conflict (user_id, course_id) do update set
    last_viewed_at = now(),
    view_count = public.user_recent_courses.view_count + 1;

  return v_course_id;
end;
$$;

revoke all on function public.record_subsection_view from public;
grant execute on function public.record_subsection_view to authenticated;

grant select on public.courses to authenticated;
grant select on public.user_recent_courses to authenticated;
grant all on public.courses to postgres, service_role;
grant all on public.user_recent_courses to postgres, service_role;
