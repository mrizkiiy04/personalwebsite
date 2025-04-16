-- Supabase Storage Policies for Media Management
-- This SQL can be executed in the Supabase SQL Editor

-- 1. Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Set up policies for the media bucket

-- 3.1 Allow authenticated users to view media files
CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 3.2 Allow authenticated users to upload media files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND auth.uid() IS NOT NULL
);

-- 3.3 Allow users to update their own media files
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'media'
  AND owner = auth.uid()
);

-- 3.4 Allow users to delete their own media files
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
);

-- 4. Set up policies for the avatars bucket

-- 4.1 Allow public access to avatar files
CREATE POLICY "Avatar files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 4.2 Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4.3 Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4.4 Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Create folders within media bucket
-- These are virtual and don't require explicit creation, but documenting for clarity
-- media/featured - For featured images
-- media/content - For content images

-- IMPORTANT: Run this SQL in the Supabase SQL Editor
-- After running, verify policies in the Storage → Policies section in your Supabase dashboard 