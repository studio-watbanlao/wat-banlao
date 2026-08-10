alter table public.blogs
  add column if not exists title text not null default '',
  add column if not exists description text,
  add column if not exists content text,
  add column if not exists image_url text not null default '',
  add column if not exists cover_storage_path text,
  add column if not exists author text,
  add column if not exists author_image_url text,
  add column if not exists created_date timestamptz;

update public.blogs
set
  title = coalesce(nullif(title, ''), data ->> 'title', ''),
  description = coalesce(description, data ->> 'description'),
  content = coalesce(content, data ->> 'content'),
  image_url = coalesce(nullif(image_url, ''), data ->> 'imageUrl', ''),
  cover_storage_path = coalesce(cover_storage_path, data ->> 'coverStoragePath'),
  author = coalesce(author, data ->> 'author', data ->> 'author_name'),
  author_image_url = coalesce(author_image_url, data ->> 'authorImageUrl'),
  created_date = coalesce(
    created_date,
    case
      when data ->> 'createdDate' ~ '^\d{4}-\d{2}-\d{2}'
      then (data ->> 'createdDate')::timestamptz
      else null
    end
  )
where data is not null;

create table if not exists public.dharmas (
  id text primary key,
  title text not null,
  description text,
  content text,
  image_url text not null,
  cover_storage_path text,
  author text,
  author_image_url text,
  created_date timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLIC', 'ARCHIVED')),
  view bigint not null default 0 check (view >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.blogs;
create trigger set_updated_at before update on public.blogs
for each row execute function public.set_content_updated_at();

drop trigger if exists set_updated_at on public.dharmas;
create trigger set_updated_at before update on public.dharmas
for each row execute function public.set_content_updated_at();

alter table public.blogs enable row level security;
alter table public.dharmas enable row level security;
revoke all on public.blogs from anon, authenticated;
revoke all on public.dharmas from anon, authenticated;

create index if not exists blogs_public_idx
on public.blogs (created_at desc) where status = 'PUBLIC';
create index if not exists dharmas_public_idx
on public.dharmas (created_at desc) where status = 'PUBLIC';

create or replace function public.increment_content_view(p_resource text, p_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  result jsonb;
begin
  case p_resource
    when 'activity' then
      update public.activities as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'architecture' then
      update public.architectures as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'fastival' then
      update public.festivals as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'sacred' then
      update public.sacred_items as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'blog' then
      update public.blogs as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    when 'dharma' then
      update public.dharmas as item set view = view + 1
      where id = p_id and status = 'PUBLIC' returning to_jsonb(item.*) into result;
    else
      result := null;
  end case;
  return result;
end;
$$;

revoke all on function public.increment_content_view(text, text) from public, anon, authenticated;
grant execute on function public.increment_content_view(text, text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('blogs', 'blogs', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('dharmas', 'dharmas', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view blog images" on storage.objects;
create policy "Public can view blog images"
on storage.objects for select to public
using (bucket_id = 'blogs');

drop policy if exists "Public can view dharma images" on storage.objects;
create policy "Public can view dharma images"
on storage.objects for select to public
using (bucket_id = 'dharmas');
