-- Production-safe seed file.
-- Intentionally left without sample content so `supabase db reset`
-- starts each temple with empty content-management tables.

notify pgrst, 'reload schema';
