-- 1) Remove overly permissive public read policy on avatars bucket
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;

-- Ensure owner-scoped read access exists
DROP POLICY IF EXISTS "avatars owner read" ON storage.objects;
CREATE POLICY "avatars owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 2) Revoke EXECUTE on SECURITY DEFINER / internal trigger functions from API roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
