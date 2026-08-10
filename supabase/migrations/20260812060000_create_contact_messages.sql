create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default 'ติดต่อจากเว็บไซต์',
  message text not null,
  status text not null default 'NEW'
    check (status in ('NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.contact_messages;
create trigger set_updated_at before update on public.contact_messages
for each row execute function public.set_content_updated_at();

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;

create index if not exists contact_messages_status_created_idx
on public.contact_messages (status, created_at desc);
