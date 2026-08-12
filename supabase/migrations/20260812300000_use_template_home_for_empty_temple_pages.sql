-- New tenants created before this fix received a published but empty managed
-- home page. That page hid the selected public template and left an image
-- skeleton on screen. Preserve genuinely edited pages and only switch empty
-- system home pages back to their selected public template.
update public.temple_pages
set use_legacy_content = true
where page_key = 'home'
  and page_type = 'SYSTEM'
  and coalesce(trim(content), '') = ''
  and coalesce(trim(hero_image_url), '') = '';
