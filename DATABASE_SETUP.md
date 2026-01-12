# Database Setup Guide

This CMS now supports Supabase (PostgreSQL) for persistent data storage, which is required for production deployments on Vercel.

## Why Database?

Vercel's serverless environment has a **read-only filesystem**, meaning file writes don't persist. A database is required for:
- ✅ Storing blog posts permanently
- ✅ Storing user accounts
- ✅ Production deployments on Vercel

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `blogger-cms` (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be created

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### Step 4: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Replace:
   - `your-project-url` with your Supabase Project URL
   - `your-anon-key` with your Supabase anon/public key

4. Click "Save"
5. **Redeploy** your application (Vercel will automatically redeploy)

### Step 5: Verify Setup

1. After redeployment, try logging in with:
   - Email: `admin@galactis.ai`
   - Password: `admin123`
2. Create a test blog post
3. Check if it persists after page refresh

## Local Development

For local development, you can either:

### Option A: Use File System (Default)
- Don't set the environment variables
- The app will automatically use the file system (`data/` folder)
- Works for local testing

### Option B: Use Supabase Locally
1. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Restart your dev server: `npm run dev`

## Troubleshooting

### "Failed to create post" error
- Check that environment variables are set correctly in Vercel
- Verify the database tables were created (check Supabase SQL Editor)
- Check Vercel deployment logs for errors

### Posts not persisting
- Ensure Supabase credentials are correct
- Verify tables exist in Supabase (go to Table Editor)
- Check browser console and Vercel logs for errors

### Login not working
- The default admin user is created in-memory if database isn't configured
- Once database is set up, you may need to create the admin user manually in Supabase

## Creating Admin User in Database

If you need to create the admin user in the database:

1. Go to Supabase → **Table Editor** → **users**
2. Click "Insert row"
3. Fill in:
   - **email**: `admin@galactis.ai`
   - **password**: `$2a$10$3hfy6d3Xi/7JCRzGbR.FiuPkUl6VbTGZzunHoPhqHRHg/2RPT9B32` (hash of "admin123")
   - **name**: `Admin`
4. Click "Save"

Or use the SQL Editor:
```sql
INSERT INTO users (email, password, name) 
VALUES (
  'admin@galactis.ai',
  '$2a$10$3hfy6d3Xi/7JCRzGbR.FiuPkUl6VbTGZzunHoPhqHRHg/2RPT9B32',
  'Admin'
);
```

## Free Tier Limits

Supabase free tier includes:
- 500 MB database storage
- 2 GB bandwidth
- Unlimited API requests
- Perfect for small to medium blogs

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check Vercel deployment logs for errors



