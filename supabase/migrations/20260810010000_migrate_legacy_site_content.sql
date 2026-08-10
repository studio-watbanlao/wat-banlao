create or replace function public.safe_jsonb_array(value text)
returns jsonb language plpgsql immutable as $$
begin
  if value is null or value = '' then return '[]'::jsonb; end if;
  if jsonb_typeof(value::jsonb) = 'array' then return value::jsonb; end if;
  return '[]'::jsonb;
exception when others then
  return '[]'::jsonb;
end;
$$;

do $$
begin
  if to_regclass('public.site_content') is null then return; end if;

  insert into public.banners (
    id, title, desktop_image_url, mobile_image_url, desktop_storage_path,
    mobile_storage_path, link_url, sort_order, status, view, created_at, updated_at
  )
  select id, coalesce(data->>'title', ''),
    coalesce(data->>'desktopImageUrl', data->>'imageUrl', ''),
    coalesce(data->>'mobileImageUrl', data->>'desktopImageUrl', data->>'imageUrl', ''),
    data->>'desktopStoragePath', data->>'mobileStoragePath', data->>'linkUrl',
    case when coalesce(data->>'sortOrder', '') ~ '^-?[0-9]+$' then (data->>'sortOrder')::integer else 0 end,
    status, view, created_at, updated_at
  from public.site_content where resource::text = 'banner'
  on conflict (id) do nothing;

  insert into public.festivals (
    id, title, year, event_no, description, image_url, cover_storage_path, images,
    content, video_url, opening_url, logo_url, created_date, status, view, created_at, updated_at
  )
  select id, coalesce(data->>'title', ''), data->>'year', data->>'no', data->>'description',
    coalesce(data->>'imageUrl', ''), data->>'coverStoragePath', public.safe_jsonb_array(data->>'images'),
    data->>'content', data->>'videoUrl', data->>'openingUrl', data->>'logoUrl',
    case when coalesce(data->>'createdDate', '') <> '' then (data->>'createdDate')::timestamptz else created_at end,
    status, view, created_at, updated_at
  from public.site_content where resource::text = 'fastival'
  on conflict (id) do nothing;

  insert into public.activities (
    id, title, activity_type, description, image_url, cover_storage_path, images,
    content, created_date, status, view, created_at, updated_at
  )
  select id, coalesce(data->>'title', ''),
    case when data->>'type' in ('temple', 'community', 'school') then data->>'type' else 'temple' end,
    data->>'description', coalesce(data->>'imageUrl', ''), data->>'coverStoragePath',
    public.safe_jsonb_array(data->>'images'), data->>'content',
    case when coalesce(data->>'createdDate', '') <> '' then (data->>'createdDate')::timestamptz else created_at end,
    status, view, created_at, updated_at
  from public.site_content where resource::text = 'activity'
  on conflict (id) do nothing;

  insert into public.sacred_items (
    id, title, year, description, image_url, cover_storage_path, images,
    content, created_date, status, view, created_at, updated_at
  )
  select id, coalesce(data->>'title', ''), data->>'year', data->>'description',
    coalesce(data->>'imageUrl', ''), data->>'coverStoragePath', public.safe_jsonb_array(data->>'images'),
    data->>'content',
    case when coalesce(data->>'createdDate', '') <> '' then (data->>'createdDate')::timestamptz else created_at end,
    status, view, created_at, updated_at
  from public.site_content where resource::text = 'sacred'
  on conflict (id) do nothing;

  insert into public.architectures (
    id, title, year, description, image_url, cover_storage_path, images, content,
    video_url, logo_url, opening_url, created_date, status, view, created_at, updated_at
  )
  select id, coalesce(data->>'title', ''), data->>'year', data->>'description',
    coalesce(data->>'imageUrl', ''), data->>'coverStoragePath', public.safe_jsonb_array(data->>'images'),
    data->>'content', data->>'videoUrl', data->>'logoUrl', data->>'openingUrl',
    case when coalesce(data->>'createdDate', '') <> '' then (data->>'createdDate')::timestamptz else created_at end,
    status, view, created_at, updated_at
  from public.site_content where resource::text = 'architecture'
  on conflict (id) do nothing;

  insert into public.blogs (id, data, status, view, created_at, updated_at)
  select id, data, status, view, created_at, updated_at
  from public.site_content where resource::text = 'blog'
  on conflict (id) do nothing;
end;
$$;

drop function public.safe_jsonb_array(text);
