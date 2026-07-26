-- The `avatars` bucket (used for onboarding profile photos,
-- app/(auth)/onboard/profile/page.tsx, uploaded to `${user.id}/...` paths)
-- has no RLS policy in any tracked migration -- it was created directly
-- against production, same as `photos`/`proofs`. Unlike those two,
-- `avatars` is actively used by the app today, so it gets the same
-- per-user-folder policy set already used for `submissions` and
-- `profile-photos` (see 20261101000000_storage_buckets.sql).
--
-- `photos` and `proofs` buckets are NOT touched here: grepping the whole
-- app turned up zero code references to either bucket -- they appear to
-- be unused legacy buckets, so adding policies for them would just be
-- guessing at access rules for a feature that no longer exists.

DROP POLICY IF EXISTS "Users can upload to own avatars folder" ON storage.objects;
CREATE POLICY "Users can upload to own avatars folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
