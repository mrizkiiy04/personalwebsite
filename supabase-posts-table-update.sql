-- Add the featured_image column to the posts table
ALTER TABLE posts 
ADD COLUMN featured_image TEXT;

-- Update the Supabase schema cache
SELECT pg_catalog.pg_reload_conf(); 