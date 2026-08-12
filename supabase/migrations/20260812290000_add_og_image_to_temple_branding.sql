alter table public.temple_branding
add column if not exists og_image_url text;

comment on column public.temple_branding.og_image_url is
  'Default Open Graph image used when public content does not provide its own cover image.';
