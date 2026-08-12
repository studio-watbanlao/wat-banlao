-- Remove only records created by the former optional mock seed.
-- Real records and the default temple/platform configuration are preserved.

delete from public.temple_pages
where temple_id = '00000000-0000-0000-0000-000000000001'
  and (
    id in (
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002'
    )
    or page_key in ('mock-meditation', 'mock-donation')
  );

delete from public.banners
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-banner-welcome', 'mock-banner-meditation', 'mock-banner-draft');

delete from public.activities
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-activity-alms', 'mock-activity-community', 'mock-activity-school');

delete from public.architectures
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-architecture-ubosot', 'mock-architecture-pavilion');

delete from public.festivals
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-festival-songkran', 'mock-festival-kathin');

delete from public.blogs
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-blog-temple-history', 'mock-blog-volunteer');

delete from public.dharmas
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-dharma-mindfulness', 'mock-dharma-kindness');

delete from public.sacred_items
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in ('mock-sacred-main-buddha', 'mock-sacred-amulet');

delete from public.temple_directory_entries
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in (
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002'
  );

delete from public.contact_messages
where temple_id = '00000000-0000-0000-0000-000000000001'
  and id in (
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003'
  );

notify pgrst, 'reload schema';
