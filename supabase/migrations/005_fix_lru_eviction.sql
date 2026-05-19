-- Fix LRU eviction (004 used OFFSET 5 on ASC, which deleted newest rows instead of oldest)
-- Run this in Supabase SQL Editor if you already applied 004

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

  delete from public.user_recent_courses urc
  where urc.user_id = v_user_id
    and urc.course_id not in (
      select keep.course_id
      from (
        select course_id
        from public.user_recent_courses
        where user_id = v_user_id
        order by last_viewed_at desc
        limit 5
      ) keep
    );

  return v_course_id;
end;
$$;

-- One-time trim: users with more than 5 rows keep only the 5 most recently viewed
with ranked as (
  select
    user_id,
    course_id,
    row_number() over (
      partition by user_id
      order by last_viewed_at desc
    ) as rn
  from public.user_recent_courses
)
delete from public.user_recent_courses urc
using ranked r
where urc.user_id = r.user_id
  and urc.course_id = r.course_id
  and r.rn > 5;
