import fs from "fs";
import path from "path";

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

// Read posts from file
export function getPosts(): BlogPost[] {
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
export function getPostById(id: string): BlogPost | null {
  const posts = getPosts();
  return posts.find((p) => p.id === id) || null;
}

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getPosts();
  return posts.find((p) => p.slug === slug) || null;
}

// Create a new post
export function createPost(post: Omit<BlogPost, "id" | "createdAt">): BlogPost {
  const posts = getPosts();
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
export function updatePost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const posts = getPosts();
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
export function deletePost(id: string): boolean {
  const posts = getPosts();
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
export function getUserByEmail(email: string): User | null {
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
export function createUser(user: Omit<User, "id">): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
  };
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return newUser;
}

