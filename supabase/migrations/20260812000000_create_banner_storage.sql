insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banners',
  'banners',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Writes are performed only by the Next.js API with the server-side secret key.
drop policy if exists "Public can view banner images" on storage.objects;
create policy "Public can view banner images"
on storage.objects for select
to public
using (bucket_id = 'banners');
