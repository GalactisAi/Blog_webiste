# Blogger CMS for Galactis.ai

A simple, headless CMS for blog authors to create and manage blog posts that automatically appear on the main Galactis.ai website.

## Features

- 🔐 Simple authentication system
- ✍️ Create, edit, and publish blog posts
- 📝 Markdown support for rich content
- 🔄 Automatic sync with main website
- 🚀 RESTful API for blog data

## Setup

1. **Install dependencies:**
   ```bash
   cd blogger-cms
   npm install
   ```

2. **Set up default admin user:**
   ```bash
   node scripts/setup-default-user.js
   ```
   This will generate a bcrypt hash for the default password. Copy the hash to `lib/db.ts` in the `defaultUsers` array.

   **Default credentials:**
   - Email: `admin@galactis.ai`
   - Password: `admin123`

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The Blogger CMS will run on `http://localhost:3001`

## Usage

1. **Login:**
   - Navigate to `http://localhost:3001`
   - Use the default credentials or create a new user

2. **Create a blog post:**
   - Click "New Post" in the dashboard
   - Fill in:
     - Title
     - Slug (URL-friendly version)
     - Excerpt (short description)
     - Content (Markdown supported)
     - Published Date
     - Check "Publish immediately" to make it live

3. **Edit/Delete posts:**
   - Use the "Edit" or "Delete" buttons in the dashboard

## API Endpoints

### Public API (for main website)

- `GET /api/feed` - Get all published blog posts
  - Returns JSON array of published posts
  - No authentication required
  - Used by the main website to fetch blog content

### Protected API (requires authentication)

- `GET /api/posts` - Get all posts (including drafts)
- `POST /api/posts` - Create a new post
- `GET /api/posts/[id]` - Get a single post
- `PUT /api/posts/[id]` - Update a post
- `DELETE /api/posts/[id]` - Delete a post

## Integration with Main Website

The main website fetches blog posts from the Blogger CMS API endpoint:

```
http://localhost:3001/api/feed
```

Set the `BLOGGER_API_URL` environment variable in the main website:

```env
BLOGGER_API_URL=http://localhost:3001/api/feed
```

For production, update this to your deployed Blogger CMS URL.

## Data Storage

Blog posts are stored in `data/posts.json` and users in `data/users.json`. These files are created automatically on first run.

**Note:** For production, consider using a proper database (PostgreSQL, MongoDB, etc.) instead of JSON files.

## Production Deployment

1. Set `JWT_SECRET` environment variable to a secure random string
2. Update `BLOGGER_API_URL` in the main website to point to your deployed Blogger CMS
3. Consider migrating from JSON file storage to a database
4. Set up proper authentication (currently uses simple JWT cookies)

## Security Notes

- Change the default admin password in production
- Use a strong `JWT_SECRET` in production
- Consider adding rate limiting to API endpoints
- Implement proper user management for multiple authors
- Add CSRF protection for authenticated routes

