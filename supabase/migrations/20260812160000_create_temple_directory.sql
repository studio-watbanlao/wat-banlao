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
      'festivals', 'blogs', 'dharmas', 'contacts', 'sacred', 'branding', 'members', 'domains'
    )
  );

create table if not exists public.temple_directory_entries (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  full_name text not null,
  display_title text,
  image_url text not null,
  image_storage_path text,
  birth text,
  age text,
  ordination text,
  vassa text,
  temple_name text,
  province text,
  affiliation text,
  education text,
  honorary_awards text,
  administrative_positions text,
  monastic_rank text,
  biography text,
  sources text,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists temple_directory_entries_temple_sort_idx
on public.temple_directory_entries (temple_id, sort_order, created_at desc);

create index if not exists temple_directory_entries_public_idx
on public.temple_directory_entries (temple_id, sort_order)
where status = 'PUBLIC';

drop trigger if exists set_updated_at on public.temple_directory_entries;
create trigger set_updated_at before update on public.temple_directory_entries
for each row execute function public.set_content_updated_at();

insert into public.temple_modules (temple_id, module_key, enabled)
select id, 'directory', true from public.temples
on conflict (temple_id, module_key) do nothing;

update public.temple_members
set permissions = jsonb_set(
  coalesce(permissions, '{}'::jsonb),
  '{directory}',
  '["read","create","update","delete","publish"]'::jsonb,
  true
)
where role = 'temple_admin';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'temple-directory',
  'temple-directory',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view temple directory images" on storage.objects;
create policy "Public can view temple directory images"
on storage.objects for select
using (bucket_id = 'temple-directory');

alter table public.temple_directory_entries enable row level security;
revoke all on public.temple_directory_entries from anon, authenticated;
grant all on public.temple_directory_entries to service_role;

notify pgrst, 'reload schema';
