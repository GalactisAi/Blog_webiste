import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
// These environment variables should be set in Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create client if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return supabase !== null;
}

