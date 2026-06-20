-- Storage buckets for submissions and profile photos

-- Create submissions bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for submissions bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own submissions folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Public can view submissions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submissions');

-- Allow users to update their own files
CREATE POLICY "Users can update own submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policies for profile-photos bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own profile-photos folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Public can view profile-photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Allow users to update their own files
CREATE POLICY "Users can update own profile-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own profile-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
