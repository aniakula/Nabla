-- Run this in the Supabase SQL Editor (or via supabase db push)

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  can_act_as_instructor boolean not null default false,
  active_mode text not null default 'student' check (active_mode in ('student', 'instructor')),
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'open_library', 'enterprise')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow insert for the authenticated user creating their own row
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, can_act_as_instructor, active_mode, onboarding_completed)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'can_act_as_instructor')::boolean, false),
    coalesce(new.raw_user_meta_data->>'active_mode', 'student'),
    coalesce((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
