-- Add social media columns to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- IMPORTANT: Run this SQL in the Supabase SQL Editor
-- After running, you may need to restart your application to see the changes
-- You can also manually refresh the database schema in the Supabase dashboard 