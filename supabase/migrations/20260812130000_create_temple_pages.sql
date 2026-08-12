create table if not exists public.temple_pages (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  page_key text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$'),
  page_type text not null default 'CUSTOM' check (page_type in ('SYSTEM', 'CUSTOM')),
  template_key text not null default 'default' check (template_key in ('default', 'landing', 'biography')),
  title text not null,
  eyebrow text,
  excerpt text,
  content text not null default '',
  hero_image_url text,
  hero_storage_path text,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  show_in_menu boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  use_legacy_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (temple_id, page_key),
  unique (temple_id, slug)
);

drop trigger if exists set_updated_at on public.temple_pages;
create trigger set_updated_at before update on public.temple_pages
for each row execute function public.set_content_updated_at();

alter table public.temple_pages enable row level security;
revoke all on public.temple_pages from anon, authenticated;

create index if not exists temple_pages_tenant_status_order_idx
on public.temple_pages (temple_id, status, sort_order, created_at desc);

alter table public.temple_modules drop constraint if exists temple_modules_module_key_check;
alter table public.temple_modules add constraint temple_modules_module_key_check check (
  module_key in (
    'dashboard', 'pages', 'banners', 'activities', 'architectures', 'directory', 'festivals',
    'blogs', 'dharmas', 'contacts', 'sacred', 'branding', 'members', 'domains'
  )
);

insert into public.temple_modules (temple_id, module_key, enabled)
select id, 'pages', true from public.temples
on conflict (temple_id, module_key) do nothing;

update public.temple_members
set permissions = permissions || '{"pages":["read","create","update","delete","publish"]}'::jsonb
where role = 'temple_admin' and not (permissions ? 'pages');

update public.temple_members
set permissions = permissions || '{"pages":["read","create","update"]}'::jsonb
where role = 'temple_editor' and not (permissions ? 'pages');

insert into public.temple_pages (
  temple_id, page_key, slug, page_type, template_key, title, eyebrow, status, show_in_menu, sort_order, use_legacy_content
)
values
  ('00000000-0000-0000-0000-000000000001', 'home', 'home', 'SYSTEM', 'landing', 'หน้าแรก', null, 'PUBLIC', true, 10, true),
  ('00000000-0000-0000-0000-000000000001', 'about', 'about-us', 'SYSTEM', 'default', 'เกี่ยวกับวัด', null, 'PUBLIC', true, 20, true),
  ('00000000-0000-0000-0000-000000000001', 'history', 'banlao/history', 'SYSTEM', 'default', 'ประวัติวัด', null, 'PUBLIC', true, 30, true),
  ('00000000-0000-0000-0000-000000000001', 'contact', 'contact-us', 'SYSTEM', 'default', 'ติดต่อวัด', null, 'PUBLIC', true, 40, true),
  ('00000000-0000-0000-0000-000000000001', 'luang-pu-pramuan', 'parents/luang-pu-pramuan', 'SYSTEM', 'biography', 'หลวงปู่ประมวล ญาณวโร', 'บูรพาจารย์', 'PUBLIC', true, 50, true),
  ('00000000-0000-0000-0000-000000000001', 'luang-pu-sa', 'parents/luang-pu-sa', 'SYSTEM', 'biography', 'หลวงปู่สาธุ์ สุขธมฺโม', 'บูรพาจารย์', 'PUBLIC', true, 60, true)
on conflict (temple_id, page_key) do nothing;

notify pgrst, 'reload schema';
