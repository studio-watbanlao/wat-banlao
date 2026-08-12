create table if not exists public.temple_visit_stats (
  temple_id uuid primary key references public.temples(id) on delete cascade,
  total_visits bigint not null default 0 check (total_visits >= 0),
  updated_at timestamptz not null default now()
);

insert into public.temple_visit_stats (temple_id, total_visits)
select id, 0 from public.temples
on conflict (temple_id) do nothing;

create or replace function public.increment_temple_visit(p_temple_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_total bigint;
begin
  insert into public.temple_visit_stats (temple_id, total_visits, updated_at)
  values (p_temple_id, 1, now())
  on conflict (temple_id) do update
    set total_visits = public.temple_visit_stats.total_visits + 1,
        updated_at = now()
  returning total_visits into next_total;

  return next_total;
end;
$$;

alter table public.temple_visit_stats enable row level security;
revoke all on public.temple_visit_stats from public, anon, authenticated;
grant all on public.temple_visit_stats to service_role;

revoke all on function public.increment_temple_visit(uuid) from public, anon, authenticated;
grant execute on function public.increment_temple_visit(uuid) to service_role;

notify pgrst, 'reload schema';
