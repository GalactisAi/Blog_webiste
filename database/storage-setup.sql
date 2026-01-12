-- Supabase Storage Setup for Blog Images
-- Run this SQL in your Supabase SQL Editor after creating the storage bucket

-- Create storage bucket for blog images (if not exists)
-- Note: You need to create the bucket in Supabase Dashboard first:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "blog-images"
-- 4. Public: Yes (so images can be accessed via URL)
-- 5. File size limit: 5MB (or your preference)
-- 6. Allowed MIME types: image/*

-- Then run this SQL to set up policies:

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow public read access to images
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

