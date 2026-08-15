-- Keep this migration self-contained. Some production databases were created
-- before the shared content trigger function was introduced.
create or replace function public.set_content_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.temples (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.temple_branding (
  temple_id uuid primary key references public.temples(id) on delete cascade,
  logo_url text,
  favicon_url text,
  primary_color text not null default '#6F4E37',
  secondary_color text not null default '#C89545',
  font_family text,
  contact jsonb not null default '{}'::jsonb check (jsonb_typeof(contact) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.temple_domains (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  domain text not null unique,
  is_primary boolean not null default false,
  ownership text not null default 'TEMPLE' check (ownership in ('TEMPLE', 'PLATFORM')),
  verification_status text not null default 'PENDING'
    check (verification_status in ('PENDING', 'VERIFIED', 'FAILED')),
  registrar text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists temple_domains_one_primary_idx
on public.temple_domains (temple_id) where is_primary;

create table if not exists public.temple_modules (
  temple_id uuid not null references public.temples(id) on delete cascade,
  module_key text not null check (
    module_key in (
      'dashboard', 'pages', 'banners', 'activities', 'architectures', 'directory', 'festivals',
      'blogs', 'dharmas', 'contacts', 'sacred', 'branding', 'members', 'domains'
    )
  ),
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  primary key (temple_id, module_key)
);

create table if not exists public.temple_members (
  temple_id uuid not null references public.temples(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'temple_editor'
    check (role in ('temple_admin', 'temple_editor')),
  permissions jsonb not null default '{}'::jsonb check (jsonb_typeof(permissions) = 'object'),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (temple_id, user_id)
);

drop trigger if exists set_updated_at on public.temples;
create trigger set_updated_at before update on public.temples
for each row execute function public.set_content_updated_at();

drop trigger if exists set_updated_at on public.temple_branding;
create trigger set_updated_at before update on public.temple_branding
for each row execute function public.set_content_updated_at();

drop trigger if exists set_updated_at on public.temple_domains;
create trigger set_updated_at before update on public.temple_domains
for each row execute function public.set_content_updated_at();

drop trigger if exists set_updated_at on public.temple_members;
create trigger set_updated_at before update on public.temple_members
for each row execute function public.set_content_updated_at();

insert into public.temples (id, slug, name, settings)
values (
  '00000000-0000-0000-0000-000000000001',
  'wat-banlao',
  'วัดบ้านเหล่า - สุขธัมมาราม',
  '{"defaultLocale":"th","timezone":"Asia/Bangkok"}'::jsonb
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name;

insert into public.temple_branding (temple_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (temple_id) do nothing;

insert into public.temple_modules (temple_id, module_key, enabled)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  module_key,
  true
from unnest(array[
  'dashboard', 'pages', 'banners', 'activities', 'architectures', 'directory', 'festivals',
  'blogs', 'dharmas', 'contacts', 'sacred', 'branding', 'members', 'domains'
]) as module_key
on conflict (temple_id, module_key) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'banners', 'festivals', 'activities', 'sacred_items',
    'architectures', 'blogs', 'dharmas', 'contact_messages'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I add column if not exists temple_id uuid', table_name);
      execute format(
        'update public.%I set temple_id = %L::uuid where temple_id is null',
        table_name,
        '00000000-0000-0000-0000-000000000001'
      );
      execute format('alter table public.%I alter column temple_id set not null', table_name);

      if not exists (
        select 1 from pg_constraint
        where conname = table_name || '_temple_id_fkey'
          and conrelid = ('public.' || table_name)::regclass
      ) then
        execute format(
          'alter table public.%I add constraint %I foreign key (temple_id) references public.temples(id) on delete cascade',
          table_name,
          table_name || '_temple_id_fkey'
        );
      end if;

      execute format(
        'create index if not exists %I on public.%I (temple_id, status, created_at desc)',
        table_name || '_temple_status_created_idx',
        table_name
      );
    end if;
  end loop;
end;
$$;

insert into public.temple_members (temple_id, user_id, role, permissions)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  profile.id,
  'temple_admin',
  '{
    "dashboard":["read"],
    "pages":["read","create","update","delete","publish"],
    "banners":["read","create","update","delete","publish"],
    "activities":["read","create","update","delete","publish"],
    "architectures":["read","create","update","delete","publish"],
    "directory":["read","create","update","delete","publish"],
    "festivals":["read","create","update","delete","publish"],
    "blogs":["read","create","update","delete","publish"],
    "dharmas":["read","create","update","delete","publish"],
    "contacts":["read","update","delete"],
    "sacred":["read","create","update","delete","publish"],
    "branding":["read","update"],
    "members":["read"],
    "domains":["read"]
  }'::jsonb
from public.profiles as profile
where profile.role in ('admin', 'super_admin')
on conflict (temple_id, user_id) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'temples', 'temple_branding', 'temple_domains', 'temple_modules', 'temple_members'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end;
$$;

drop function if exists public.increment_content_view(text, text);
create or replace function public.increment_content_view(
  p_resource text,
  p_id text,
  p_temple_id uuid
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  result jsonb;
begin
  case p_resource
    when 'activity' then
      update public.activities as item set view = view + 1
      where id = p_id and temple_id = p_temple_id and status = 'PUBLIC'
      returning to_jsonb(item.*) into result;
    when 'architecture' then
      update public.architectures as item set view = view + 1
      where id = p_id and temple_id = p_temple_id and status = 'PUBLIC'
      returning to_jsonb(item.*) into result;
    when 'fastival' then
      update public.festivals as item set view = view + 1
      where id = p_id and temple_id = p_temple_id and status = 'PUBLIC'
      returning to_jsonb(item.*) into result;
    when 'sacred' then
      update public.sacred_items as item set view = view + 1
      where id = p_id and temple_id = p_temple_id and status = 'PUBLIC'
      returning to_jsonb(item.*) into result;
    when 'blog' then
      update public.blogs as item set view = view + 1
      where id = p_id and temple_id = p_temple_id and status = 'PUBLIC'
      returning to_jsonb(item.*) into result;
    when 'dharma' then
      update public.dharmas as item set view = view + 1
      where id = p_id and temple_id = p_temple_id and status = 'PUBLIC'
      returning to_jsonb(item.*) into result;
    else
      result := null;
  end case;
  return result;
end;
$$;

revoke all on function public.increment_content_view(text, text, uuid) from public, anon, authenticated;
grant execute on function public.increment_content_view(text, text, uuid) to service_role;

-- Make newly-created tables and RPC signatures available to PostgREST immediately.
notify pgrst, 'reload schema';
