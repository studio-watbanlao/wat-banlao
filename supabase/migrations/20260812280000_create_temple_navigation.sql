create table if not exists public.temple_navigation_items (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  item_key text not null,
  title text not null,
  path text not null,
  parent_key text,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  deep_match boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (temple_id, item_key)
);

create index if not exists temple_navigation_tenant_order_idx
on public.temple_navigation_items (temple_id, parent_key, sort_order);

alter table public.temple_navigation_items enable row level security;
revoke all on public.temple_navigation_items from anon, authenticated;

insert into public.temple_navigation_items
  (temple_id, item_key, title, path, parent_key, sort_order, enabled, deep_match)
select temples.id, defaults.item_key, defaults.title, defaults.path, defaults.parent_key,
  defaults.sort_order, true, defaults.deep_match
from public.temples
cross join (values
  ('home', 'หน้าหลัก', '/', null, 10, false),
  ('festivals', 'เทศกาลงานบุญ', '/fastival', null, 20, true),
  ('temple', 'รู้จักวัด', '/banlao', null, 30, true),
  ('temple-history', 'ประวัติวัด', '/banlao/history', 'temple', 10, false),
  ('temple-architecture', 'สถาปัตย์และสิ่งสำคัญ', '/banlao/architecture', 'temple', 20, true),
  ('temple-abbot', 'เจ้าอาวาส', '/banlao/abbot', 'temple', 30, false),
  ('temple-monks', 'ทำเนียบพระสงฆ์', '/banlao/monks', 'temple', 40, false),
  ('masters', 'ชีวประวัติบูรพาจารย์', '/parents', null, 40, true),
  ('master-sa', 'หลวงปู่สาธุ์ สุขธมฺโม', '/parents/luang-pu-sa', 'masters', 10, false),
  ('master-pramuan', 'หลวงปู่ประมวล ญาณวโร', '/parents/luang-pu-pramuan', 'masters', 20, false),
  ('sacred', 'วัตถุมงคล', '/parents/sacred', 'masters', 30, true),
  ('articles', 'บทความ/ธรรมะ', '/article', null, 50, true),
  ('blogs', 'บทความ', '/article/blog', 'articles', 10, true),
  ('dharmas', 'ธรรมะ', '/article/dharma', 'articles', 20, true),
  ('activities', 'กิจกรรมและข่าวสาร', '/activity', null, 60, true),
  ('community', 'ชุมชน', '/community', null, 70, true),
  ('community-history', 'ประวัติชุมชน', '/community/community-history', 'community', 10, false),
  ('community-leaders', 'ผู้นำชุมชน', '/community/community-leaders', 'community', 20, false),
  ('community-school', 'โรงเรียนชุมชน', '/community/school', 'community', 30, false)
) as defaults(item_key, title, path, parent_key, sort_order, deep_match)
on conflict (temple_id, item_key) do nothing;

notify pgrst, 'reload schema';
