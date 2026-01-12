import fs from "fs";
import path from "path";
import { isDatabaseConfigured } from "./supabase";
import {
  getPostsFromDB,
  getPostByIdFromDB,
  getPostBySlugFromDB,
  createPostInDB,
  updatePostInDB,
  deletePostFromDB,
  getUserByEmailFromDB,
  createUserInDB,
} from "./db-supabase";

// Use absolute path to ensure we're in the right directory
const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// In-memory storage for posts (used when database not configured and file system not writable)
// This is a temporary solution for serverless environments until database is set up
let inMemoryPosts: BlogPost[] = [];

// Debug: Log paths in development
if (process.env.NODE_ENV === "development") {
  console.log("[DB] Data directory:", DATA_DIR);
  console.log("[DB] Posts file:", POSTS_FILE);
  console.log("[DB] Posts file exists:", fs.existsSync(POSTS_FILE));
}

// Lazy initialization function
function ensureDataFiles() {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Initialize files if they don't exist
    if (!fs.existsSync(POSTS_FILE)) {
      fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2), "utf-8");
    }

    if (!fs.existsSync(USERS_FILE)) {
      // Create empty users file - default admin will be created on first access
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Error initializing data files:", error);
    // Don't throw - return empty arrays instead
  }
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  updatedAt?: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

// Read posts from database, file, or memory
export async function getPosts(): Promise<BlogPost[]> {
  // Use database if configured (for production/serverless)
  if (isDatabaseConfigured()) {
    return await getPostsFromDB();
  }

  // Fallback to file system (for local development)
  try {
    ensureDataFiles();
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, "utf-8");
      const posts = JSON.parse(data);
      // Sync in-memory with file system
      if (Array.isArray(posts)) {
        inMemoryPosts = posts;
        return posts;
      }
    }
  } catch (error) {
    console.error("Error reading posts from file:", error);
  }

  // Fallback to in-memory storage (for serverless when file system not writable)
  return inMemoryPosts;
}

// Write posts to file or memory
export function savePosts(posts: BlogPost[]): void {
  // Update in-memory storage
  inMemoryPosts = posts;

  // Try to save to file system (works in local dev, fails on serverless)
  try {
    ensureDataFiles();
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
  } catch (error) {
    // On serverless (Vercel), file writes fail - that's okay, we use in-memory
    // Log warning but don't throw - in-memory storage will work for this request
    console.warn("Could not write to file system (serverless environment), using in-memory storage");
  }
}

// Get a single post by ID
export async function getPostById(id: string): Promise<BlogPost | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    const post = await getPostByIdFromDB(id);
    if (post) return post;
    // Fall through to check in-memory if not found in DB
  }

  // Fallback to in-memory/file system
  const posts = await getPosts();
  return posts.find((p) => p.id === id) || null;
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    const post = await getPostBySlugFromDB(slug);
    if (post) return post;
    // Fall through to check in-memory if not found in DB
  }

  // Fallback to in-memory/file system
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) || null;
}

// Create a new post
export async function createPost(
  post: Omit<BlogPost, "id" | "createdAt">
): Promise<BlogPost> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    try {
      return await createPostInDB(post);
    } catch (error) {
      console.error("Database error, falling back to in-memory:", error);
      // Fall through to in-memory storage
    }
  }

  // Fallback to in-memory storage (works on serverless)
  const posts = await getPosts();
  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  savePosts(posts); // This will update in-memory storage
  return newPost;
}

// Update a post
export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    try {
      return await updatePostInDB(id, updates);
    } catch (error) {
      console.error("Database error, falling back to in-memory:", error);
      // Fall through to in-memory storage
    }
  }

  // Fallback to in-memory storage
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  posts[index] = {
    ...posts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  savePosts(posts);
  return posts[index];
}

// Delete a post
export async function deletePost(id: string): Promise<boolean> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    try {
      return await deletePostFromDB(id);
    } catch (error) {
      console.error("Database error, falling back to in-memory:", error);
      // Fall through to in-memory storage
    }
  }

  // Fallback to in-memory storage
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  savePosts(filtered);
  return true;
}

// Read users from file
export function getUsers(): User[] {
  try {
    ensureDataFiles();
    // Check if file exists and is readable
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users = JSON.parse(data);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    // On serverless, file might not exist or be readable - return empty array
    // getUserByEmail will handle returning default admin
    console.error("Error reading users:", error);
    return [];
  }
}

// Default admin user (for serverless environments where file writes don't persist)
const DEFAULT_ADMIN_USER: User = {
  id: "1",
  email: "admin@galactis.ai",
  password: "$2a$10$3hfy6d3Xi/7JCRzGbR.FiuPkUl6VbTGZzunHoPhqHRHg/2RPT9B32", // hash of "admin123"
  name: "Admin",
};

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    const user = await getUserByEmailFromDB(email);
    if (user) return user;
    // If not found in DB and requesting default admin, return default (for first-time setup)
    if (email === "admin@galactis.ai") {
      return DEFAULT_ADMIN_USER;
    }
    return null;
  }

  // Fallback to file system
  try {
    const users = getUsers();
    const user = users.find((u) => u.email === email);
    
    // If user found in file, return it
    if (user) {
      return user;
    }
    
    // If no users in file and requesting default admin, return default admin (for serverless)
    // This handles Vercel/serverless where file writes don't persist
    if (users.length === 0 && email === "admin@galactis.ai") {
      return DEFAULT_ADMIN_USER;
    }
    
    return null;
  } catch (error) {
    // If file read fails (e.g., on serverless), return default admin for the default email
    if (email === "admin@galactis.ai") {
      return DEFAULT_ADMIN_USER;
    }
    return null;
  }
}

// Create a new user
export async function createUser(user: Omit<User, "id">): Promise<User> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    return await createUserInDB(user);
  }

  // Fallback to file system
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
  };
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return newUser;
}

