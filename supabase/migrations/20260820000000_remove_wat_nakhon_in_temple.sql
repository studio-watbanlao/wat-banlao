-- Remove the unwanted tenant. Related branding, domains, memberships, pages,
-- navigation, and content rows are removed by their ON DELETE CASCADE keys.
delete from public.temples
where slug = 'wat-nakhon-in';

