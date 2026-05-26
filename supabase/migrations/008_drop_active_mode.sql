-- Drop active_mode column — mode switching replaced by a single unified
-- dashboard that shows instructor widgets based on is_instructor flag.

alter table public.profiles
  drop column if exists active_mode;

-- Update the new-user trigger so it no longer sets active_mode
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    is_instructor,
    onboarding_completed
  )
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    coalesce((new.raw_user_meta_data->>'is_instructor')::boolean, false),
    coalesce((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  )
  on conflict (id) do update set
    display_name    = excluded.display_name,
    is_instructor   = excluded.is_instructor,
    onboarding_completed = excluded.onboarding_completed,
    updated_at      = now();
  return new;
end;
$$;
