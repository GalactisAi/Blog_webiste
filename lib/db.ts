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

// Read posts from database or file
export async function getPosts(): Promise<BlogPost[]> {
  // Use database if configured (for production/serverless)
  if (isDatabaseConfigured()) {
    return await getPostsFromDB();
  }

  // Fallback to file system (for local development)
  try {
    ensureDataFiles();
    const data = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

// Write posts to file
export function savePosts(posts: BlogPost[]): void {
  try {
    ensureDataFiles();
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error("Error saving posts:", error);
    throw error;
  }
}

// Get a single post by ID
export async function getPostById(id: string): Promise<BlogPost | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    return await getPostByIdFromDB(id);
  }

  // Fallback to file system
  const posts = await getPosts();
  return posts.find((p) => p.id === id) || null;
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    return await getPostBySlugFromDB(slug);
  }

  // Fallback to file system
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) || null;
}

// Create a new post
export async function createPost(
  post: Omit<BlogPost, "id" | "createdAt">
): Promise<BlogPost> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    return await createPostInDB(post);
  }

  // Fallback to file system
  const posts = await getPosts();
  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  savePosts(posts);
  return newPost;
}

// Update a post
export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost | null> {
  // Use database if configured
  if (isDatabaseConfigured()) {
    return await updatePostInDB(id, updates);
  }

  // Fallback to file system
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
    return await deletePostFromDB(id);
  }

  // Fallback to file system
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

