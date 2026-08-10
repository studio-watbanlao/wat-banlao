do $$
begin
  create type public.app_role as enum ('user', 'admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  provider text not null default 'email',
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(lower(email));

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_role public.app_role;
begin
  resolved_role := case new.raw_app_meta_data ->> 'role'
    when 'admin' then 'admin'::public.app_role
    when 'super_admin' then 'super_admin'::public.app_role
    else 'user'::public.app_role
  end;

  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    provider,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.email
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    resolved_role,
    new.created_at,
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    provider = excluded.provider,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists auth_user_sync_profile on auth.users;
create trigger auth_user_sync_profile
after insert or update of email, raw_user_meta_data, raw_app_meta_data
on auth.users
for each row execute function public.sync_auth_user_profile();

-- Backfill users that existed before this migration.
insert into public.profiles (
  id,
  email,
  display_name,
  avatar_url,
  provider,
  role,
  created_at,
  updated_at
)
select
  user_record.id,
  user_record.email,
  coalesce(
    user_record.raw_user_meta_data ->> 'full_name',
    user_record.raw_user_meta_data ->> 'name',
    user_record.email
  ),
  coalesce(
    user_record.raw_user_meta_data ->> 'avatar_url',
    user_record.raw_user_meta_data ->> 'picture'
  ),
  coalesce(user_record.raw_app_meta_data ->> 'provider', 'email'),
  case user_record.raw_app_meta_data ->> 'role'
    when 'admin' then 'admin'::public.app_role
    when 'super_admin' then 'super_admin'::public.app_role
    else 'user'::public.app_role
  end,
  user_record.created_at,
  now()
from auth.users as user_record
on conflict (id) do update set
  email = excluded.email,
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  provider = excluded.provider,
  role = excluded.role,
  updated_at = now();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();
