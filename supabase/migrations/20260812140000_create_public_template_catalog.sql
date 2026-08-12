create table if not exists public.public_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique check (template_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  preview jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'READY', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_public_template_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists public_templates_updated_at on public.public_templates;
create trigger public_templates_updated_at
before update on public.public_templates
for each row execute function public.touch_public_template_updated_at();

alter table public.public_templates enable row level security;
revoke all on public.public_templates from anon, authenticated;
grant all on public.public_templates to service_role;

insert into public.public_templates
  (template_key, name, description, features, preview, status)
values
  (
    'custom',
    'บ้านเหล่า Classic',
    'รูปแบบเดิมของวัดบ้านเหล่า เน้นข้อมูลครบถ้วนและเมนูสองระดับ',
    '["Header สองแถว", "หน้าแรกเนื้อหาครบ", "Footer แบบข้อมูลวัด"]'::jsonb,
    '{"background":"#FFFFFF","surface":"#F7F2EC","accent":"#6F4E37","text":"#34251D"}'::jsonb,
    'READY'
  ),
  (
    'serene',
    'Serene Temple',
    'รูปแบบโปร่ง สงบ และร่วมสมัย เหมาะกับวัดที่ต้องการภาพลักษณ์เรียบหรู',
    '["Header แถวเดียว", "Hero เต็มพื้นที่", "Footer สีเข้ม"]'::jsonb,
    '{"background":"#F8F7F2","surface":"#FFFFFF","accent":"#9A6A32","text":"#25302B"}'::jsonb,
    'READY'
  )
on conflict (template_key) do nothing;

notify pgrst, 'reload schema';

