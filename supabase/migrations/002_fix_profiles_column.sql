-- Run this in Supabase SQL Editor if signup still fails with
-- "Database error saving new user"

-- 1. Align column name: can_act_as_instructor → is_instructor (if needed)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'can_act_as_instructor'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'is_instructor'
  ) then
    alter table public.profiles
      rename column can_act_as_instructor to is_instructor;
  end if;
end $$;

-- 2. Recreate trigger function (must match is_instructor column)
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
    active_mode,
    onboarding_completed
  )
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    coalesce((new.raw_user_meta_data->>'is_instructor')::boolean, false),
    coalesce(new.raw_user_meta_data->>'active_mode', 'student'),
    coalesce((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    is_instructor = excluded.is_instructor,
    active_mode = excluded.active_mode,
    onboarding_completed = excluded.onboarding_completed,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Permissions (common fix for auth trigger failures)
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on public.profiles to postgres, service_role;
grant select, insert, update on public.profiles to authenticated;
