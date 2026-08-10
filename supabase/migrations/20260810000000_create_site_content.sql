do $$
begin
  create type public.content_resource as enum (
    'activity',
    'architecture',
    'banner',
    'blog',
    'fastival',
    'sacred'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.site_content (
  resource public.content_resource not null,
  id text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (resource, id),
  constraint site_content_data_is_object check (jsonb_typeof(data) = 'object')
);

create index if not exists site_content_public_list_idx
  on public.site_content (resource, created_at desc)
  where status = 'PUBLIC';

alter table public.site_content enable row level security;

-- The browser never connects to this table. Only the Next.js API uses the service role.
revoke all on public.site_content from anon, authenticated;

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_site_content_updated_at();

create or replace function public.increment_content_view(
  p_resource public.content_resource,
  p_id text
)
returns public.site_content
language sql
security definer
set search_path = public
as $$
  update public.site_content
  set view = view + 1
  where resource = p_resource
    and id = p_id
    and status = 'PUBLIC'
  returning *;
$$;

revoke all on function public.increment_content_view(public.content_resource, text)
  from public, anon, authenticated;
grant execute on function public.increment_content_view(public.content_resource, text)
  to service_role;
