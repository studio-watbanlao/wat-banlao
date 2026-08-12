-- Every active temple member owns a dashboard scoped to their temple and permissions.
update public.temple_members
set permissions = jsonb_set(
  coalesce(permissions, '{}'::jsonb),
  '{dashboard}',
  '["read"]'::jsonb,
  true
);

update public.temple_invitations
set permissions = jsonb_set(
  coalesce(permissions, '{}'::jsonb),
  '{dashboard}',
  '["read"]'::jsonb,
  true
)
where status = 'PENDING';

notify pgrst, 'reload schema';
