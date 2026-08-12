create table if not exists public.popup_banners (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  title text not null,
  image_url text not null,
  storage_path text,
  link_url text,
  display_frequency text not null default 'ONCE_PER_SESSION'
    check (display_frequency in ('EVERY_VISIT', 'ONCE_PER_SESSION', 'ONCE_PER_DAY')),
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint popup_banners_date_range_check
    check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

create index if not exists popup_banners_temple_list_idx
on public.popup_banners (temple_id, sort_order, created_at desc);

create index if not exists popup_banners_public_idx
on public.popup_banners (temple_id, starts_at, ends_at, sort_order)
where status = 'PUBLIC';

create or replace function public.set_content_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.popup_banners;
create trigger set_updated_at
before update on public.popup_banners
for each row execute function public.set_content_updated_at();

alter table public.popup_banners enable row level security;
revoke all on public.popup_banners from anon, authenticated;
