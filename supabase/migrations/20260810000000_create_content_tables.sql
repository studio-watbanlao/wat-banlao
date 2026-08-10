create table if not exists public.banners (
  id text primary key,
  title text not null,
  desktop_image_url text not null,
  mobile_image_url text not null,
  desktop_storage_path text,
  mobile_storage_path text,
  link_url text,
  sort_order integer not null default 0,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.festivals (
  id text primary key,
  title text not null,
  year text,
  event_no text,
  description text,
  image_url text not null,
  cover_storage_path text,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  content text,
  video_url text,
  opening_url text,
  logo_url text,
  created_date timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id text primary key,
  title text not null,
  activity_type text not null default 'temple' check (activity_type in ('temple', 'community', 'school')),
  description text,
  image_url text not null,
  cover_storage_path text,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  content text,
  created_date timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sacred_items (
  id text primary key,
  title text not null,
  year text,
  description text,
  image_url text not null,
  cover_storage_path text,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  content text,
  created_date timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.architectures (
  id text primary key,
  title text not null,
  year text,
  description text,
  image_url text not null,
  cover_storage_path text,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  content text,
  video_url text,
  logo_url text,
  opening_url text,
  created_date timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id text primary key,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_content_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['banners', 'festivals', 'activities', 'sacred_items', 'architectures', 'blogs']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_content_updated_at()',
      table_name
    );
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end;
$$;

create index if not exists banners_public_idx on public.banners (sort_order, created_at desc) where status = 'PUBLIC';
create index if not exists festivals_public_idx on public.festivals (created_at desc) where status = 'PUBLIC';
create index if not exists activities_public_idx on public.activities (created_at desc) where status = 'PUBLIC';
create index if not exists sacred_items_public_idx on public.sacred_items (created_at desc) where status = 'PUBLIC';
create index if not exists architectures_public_idx on public.architectures (created_at desc) where status = 'PUBLIC';
create index if not exists blogs_public_idx on public.blogs (created_at desc) where status = 'PUBLIC';

do $$
begin
  if to_regtype('public.content_resource') is not null then
    execute 'drop function if exists public.increment_content_view(public.content_resource, text)';
  end if;
end;
$$;

create or replace function public.increment_content_view(p_resource text, p_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  result jsonb;
begin
  case p_resource
    when 'activity' then
      update public.activities as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'architecture' then
      update public.architectures as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'fastival' then
      update public.festivals as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'sacred' then
      update public.sacred_items as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'blog' then
      update public.blogs as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    else
      result := null;
  end case;
  return result;
end;
$$;

revoke all on function public.increment_content_view(text, text) from public, anon, authenticated;
grant execute on function public.increment_content_view(text, text) to service_role;
