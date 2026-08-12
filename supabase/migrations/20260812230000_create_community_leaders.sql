create or replace function public.set_content_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.temple_modules
  drop constraint if exists temple_modules_module_key_check;

alter table public.temple_modules
  add constraint temple_modules_module_key_check
  check (
    module_key in (
      'dashboard', 'pages', 'banners', 'activities', 'architectures', 'directory',
      'community_leaders', 'festivals', 'blogs', 'dharmas', 'contacts', 'sacred',
      'branding', 'members', 'domains'
    )
  );

create table if not exists public.community_leaders (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  village_key text not null check (
    village_key in (
      'lao-nong-kham', 'lao-nai', 'lao-don-khaen',
      'lao-ngio', 'ma-hep', 'non-samran'
    )
  ),
  full_name text not null,
  role text not null,
  responsibility text,
  phone text,
  leader_group text not null default 'other' check (
    leader_group in ('village-head', 'assistant', 'council', 'other')
  ),
  image_url text not null,
  image_storage_path text,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_leaders_temple_village_sort_idx
on public.community_leaders (temple_id, village_key, sort_order, created_at desc);

create index if not exists community_leaders_public_idx
on public.community_leaders (temple_id, village_key, sort_order)
where status = 'PUBLIC';

drop trigger if exists set_updated_at on public.community_leaders;
create trigger set_updated_at before update on public.community_leaders
for each row execute function public.set_content_updated_at();

insert into public.temple_modules (temple_id, module_key, enabled)
select id, 'community_leaders', true from public.temples
on conflict (temple_id, module_key) do update set enabled = true;

update public.temple_members
set permissions = jsonb_set(
  coalesce(permissions, '{}'::jsonb),
  '{community_leaders}',
  '["read","create","update","delete","publish"]'::jsonb,
  true
)
where role = 'temple_admin';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-leaders',
  'community-leaders',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view community leader images" on storage.objects;
create policy "Public can view community leader images"
on storage.objects for select
using (bucket_id = 'community-leaders');

alter table public.community_leaders enable row level security;
revoke all on public.community_leaders from anon, authenticated;
grant all on public.community_leaders to service_role;

notify pgrst, 'reload schema';
