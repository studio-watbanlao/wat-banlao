alter table public.profiles
  add column if not exists pen_name text;

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
    id, email, display_name, avatar_url, provider, role, created_at, updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
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
