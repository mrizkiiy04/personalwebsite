-- Supabase fixes for media storage and posts table

-- 1. Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Add the featured_image column to the posts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'featured_image'
    ) THEN
        ALTER TABLE posts 
        ADD COLUMN featured_image TEXT;
    END IF;
END$$;

-- 4. Set up policies for the storage.buckets table

-- 4.1 Allow users to view bucket information
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'buckets' 
        AND policyname = 'Allow public bucket access'
    ) THEN
        CREATE POLICY "Allow public bucket access"
        ON storage.buckets FOR SELECT
        USING (public = true);
    END IF;
END$$;

-- 4.2 Allow authenticated users to view all buckets (helps with troubleshooting)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'buckets' 
        AND policyname = 'Allow authenticated users to view all buckets'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all buckets"
        ON storage.buckets FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END$$;

-- 5. Set up policies for the storage.objects table

-- 5.1 Allow authenticated users to view media files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Media files are publicly accessible'
    ) THEN
        CREATE POLICY "Media files are publicly accessible"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'media');
    END IF;
END$$;

-- 5.2 Allow authenticated users to upload media files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can upload media'
    ) THEN
        CREATE POLICY "Authenticated users can upload media"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'media'
          AND auth.uid() IS NOT NULL
        );
    END IF;
END$$;

-- 5.3 Allow users to update their own media files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own media'
    ) THEN
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
    END IF;
END$$;

-- 5.4 Allow users to delete their own media files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own media'
    ) THEN
        CREATE POLICY "Users can delete their own media"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'media'
          AND owner = auth.uid()
        );
    END IF;
END$$;

-- IMPORTANT: Run this SQL in the Supabase SQL Editor
-- After running, verify that the buckets exist in Storage and that
-- the featured_image column exists in the posts table 
-- You may need to refresh your browser or reconnect to see the changes 