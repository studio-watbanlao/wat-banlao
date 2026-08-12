alter table public.temple_members
  drop constraint if exists temple_members_role_check;

alter table public.temple_members
  add constraint temple_members_role_check
  check (role in ('temple_admin', 'temple_editor', 'temple_contributor'));

create table if not exists public.temple_invitations (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null default 'temple_contributor'
    check (role in ('temple_editor', 'temple_contributor')),
  permissions jsonb not null default '{}'::jsonb check (jsonb_typeof(permissions) = 'object'),
  token_hash text not null unique,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  delivery_status text not null default 'PENDING'
    check (delivery_status in ('PENDING', 'SENT', 'ACCOUNT_EXISTS', 'FAILED')),
  invited_by uuid not null references public.profiles(id),
  accepted_by uuid references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists temple_invitations_one_pending_email_idx
on public.temple_invitations (temple_id, lower(email))
where status = 'PENDING';

create index if not exists temple_invitations_email_status_idx
on public.temple_invitations (lower(email), status, expires_at);

drop trigger if exists set_updated_at on public.temple_invitations;
create trigger set_updated_at before update on public.temple_invitations
for each row execute function public.set_content_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'banners', 'festivals', 'activities', 'sacred_items', 'architectures',
    'blogs', 'dharmas', 'temple_pages'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format(
        'alter table public.%I add column if not exists created_by uuid references public.profiles(id) on delete set null',
        table_name
      );
      execute format(
        'create index if not exists %I on public.%I (temple_id, created_by, created_at desc)',
        table_name || '_temple_creator_idx',
        table_name
      );
    end if;
  end loop;
end;
$$;

update public.temple_members
set permissions = jsonb_set(
  coalesce(permissions, '{}'::jsonb),
  '{members}',
  '["read","create","update","delete"]'::jsonb,
  true
)
where role = 'temple_admin';

alter table public.temple_invitations enable row level security;
revoke all on public.temple_invitations from anon, authenticated;
grant all on public.temple_invitations to service_role;

notify pgrst, 'reload schema';

