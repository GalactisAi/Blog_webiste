# Image Storage Setup Guide

This CMS supports image uploads with two methods:
1. **File Upload** - Upload images from your computer
2. **Image URL** - Use images from external URLs

## Storage Options

### Option 1: Supabase Storage (Recommended for Production)

Supabase Storage provides persistent, scalable image storage.

#### Setup Steps:

1. **Create Storage Bucket in Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to **Storage** in the sidebar
   - Click **"New bucket"**
   - Configure:
     - **Name:** `blog-images`
     - **Public bucket:** ✅ Yes (so images are accessible via URL)
     - **File size limit:** 5MB (or your preference)
     - **Allowed MIME types:** `image/*`
   - Click **"Create bucket"**

2. **Set Up Storage Policies:**
   - Go to **Storage** → **Policies** → **blog-images**
   - Or run the SQL from `database/storage-setup.sql` in the SQL Editor
   - This allows:
     - Authenticated users to upload/update/delete images
     - Public read access to view images

3. **Verify Setup:**
   - Try uploading an image in the CMS
   - Check that the image appears in Supabase Storage
   - Verify the image URL works

### Option 2: Base64 Encoding (Fallback)

If Supabase Storage is not configured, images are stored as base64 data URLs. This works but:
- ⚠️ Not recommended for production
- Images are stored in the database (increases size)
- Limited to smaller images
- Works temporarily until Supabase is set up

## Image Upload Features

- **File Upload:**
  - Supports: JPG, PNG, GIF, WebP
  - Max file size: 5MB
  - Automatic upload to Supabase Storage (if configured)

- **Image URL:**
  - Enter any publicly accessible image URL
  - No upload required
  - Image is stored as-is

## Usage

1. **In Post Creation/Edit Form:**
   - Click **"Add Cover Image"** button
   - Choose **"Upload Image"** or **"Image URL"**
   - For upload: Select file from your computer
   - For URL: Paste the image URL
   - Click to confirm

2. **Remove Image:**
   - Click the **×** button on the image preview

## Troubleshooting

### "Upload failed" error
- Check that Supabase Storage bucket exists
- Verify storage policies are set correctly
- Check file size (must be < 5MB)
- Ensure file is a valid image format

### Images not displaying
- Check that the storage bucket is set to **Public**
- Verify the image URL is accessible
- Check browser console for errors

### Images not persisting
- Ensure Supabase Storage is properly configured
- Check that storage policies allow public read access
- Verify environment variables are set correctly

## Best Practices

1. **Use Supabase Storage for production** - It's free, scalable, and reliable
2. **Optimize images before upload** - Compress images to reduce file size
3. **Use descriptive filenames** - Helps with organization
4. **Set appropriate file size limits** - Balance quality vs. performance

## Free Tier Limits

Supabase Storage free tier includes:
- 1 GB storage
- 2 GB bandwidth
- Perfect for small to medium blogs

For larger needs, consider upgrading or using a CDN.

