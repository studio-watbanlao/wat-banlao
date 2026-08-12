alter table public.temple_branding
add column if not exists login_background_url text;

comment on column public.temple_branding.login_background_url is
  'Public URL of the background image used on this temple login page.';
