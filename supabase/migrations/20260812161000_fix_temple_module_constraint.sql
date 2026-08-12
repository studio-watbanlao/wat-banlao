-- ทำให้ข้อจำกัดรองรับทุกโมดูลปัจจุบัน แม้ migrations รุ่นก่อนหน้าจะถูกรันซ้ำ
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
where role = 'temple_admin'
  and not (coalesce(permissions, '{}'::jsonb) ? 'directory');

notify pgrst, 'reload schema';
