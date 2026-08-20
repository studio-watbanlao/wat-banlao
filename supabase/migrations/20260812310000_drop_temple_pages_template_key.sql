-- The template_key selector (default/landing/biography) never drove distinct
-- rendering beyond a one-off center alignment, and this deployment only
-- manages a single temple's pages. Drop the unused column.
alter table public.temple_pages drop column if exists template_key;

notify pgrst, 'reload schema';
