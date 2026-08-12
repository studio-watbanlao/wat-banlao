alter table public.activities
  add column if not exists content_kind text not null default 'activity';

alter table public.activities
  drop constraint if exists activities_content_kind_check;

alter table public.activities
  add constraint activities_content_kind_check
  check (content_kind in ('activity', 'news'));

create index if not exists activities_content_kind_created_idx
on public.activities (temple_id, content_kind, created_at desc);

notify pgrst, 'reload schema';
