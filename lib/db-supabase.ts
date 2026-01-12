import { supabase, isDatabaseConfigured } from "./supabase";
import { BlogPost, User } from "./db";

// Database adapter for Supabase
// This handles all database operations when Supabase is configured

export async function getPostsFromDB(): Promise<BlogPost[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from("posts")
      .select("*")
      .order("published_date", { ascending: false });

    if (error) {
      console.error("Error fetching posts from database:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id.toString(),
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt || "",
      content: row.content || "",
      publishedDate: row.published_date,
      updatedAt: row.updated_at || row.created_at,
      coverImage: row.cover_image || undefined,
      published: row.published || false,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("Error in getPostsFromDB:", error);
    return [];
  }
}

export async function getPostByIdFromDB(id: string): Promise<BlogPost | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id.toString(),
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content || "",
      publishedDate: data.published_date,
      updatedAt: data.updated_at || data.created_at,
      coverImage: data.cover_image || undefined,
      published: data.published || false,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error in getPostByIdFromDB:", error);
    return null;
  }
}

export async function getPostBySlugFromDB(slug: string): Promise<BlogPost | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id.toString(),
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content || "",
      publishedDate: data.published_date,
      updatedAt: data.updated_at || data.created_at,
      coverImage: data.cover_image || undefined,
      published: data.published || false,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error in getPostBySlugFromDB:", error);
    return null;
  }
}

export async function createPostInDB(
  post: Omit<BlogPost, "id" | "createdAt">
): Promise<BlogPost> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  try {
    const { data, error } = await supabase!
      .from("posts")
      .insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        published_date: post.publishedDate,
        published: post.published || false,
        cover_image: post.coverImage || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post in database:", error);
      throw error;
    }

    return {
      id: data.id.toString(),
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content || "",
      publishedDate: data.published_date,
      updatedAt: data.updated_at || data.created_at,
      coverImage: data.cover_image || undefined,
      published: data.published || false,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error in createPostInDB:", error);
    throw error;
  }
}

export async function updatePostInDB(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.publishedDate !== undefined)
      updateData.published_date = updates.publishedDate;
    if (updates.published !== undefined) updateData.published = updates.published;
    if (updates.coverImage !== undefined)
      updateData.cover_image = updates.coverImage || null;

    const { data, error } = await supabase!
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating post in database:", error);
      return null;
    }

    return {
      id: data.id.toString(),
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content || "",
      publishedDate: data.published_date,
      updatedAt: data.updated_at || data.created_at,
      coverImage: data.cover_image || undefined,
      published: data.published || false,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error in updatePostInDB:", error);
    return null;
  }
}

export async function deletePostFromDB(id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase!.from("posts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting post from database:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deletePostFromDB:", error);
    return false;
  }
}

export async function getUserByEmailFromDB(email: string): Promise<User | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id.toString(),
      email: data.email,
      password: data.password,
      name: data.name,
    };
  } catch (error) {
    console.error("Error in getUserByEmailFromDB:", error);
    return null;
  }
}

export async function createUserInDB(user: Omit<User, "id">): Promise<User> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  try {
    const { data, error } = await supabase!
      .from("users")
      .insert({
        email: user.email,
        password: user.password,
        name: user.name,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user in database:", error);
      throw error;
    }

    return {
      id: data.id.toString(),
      email: data.email,
      password: data.password,
      name: data.name,
    };
  } catch (error) {
    console.error("Error in createUserInDB:", error);
    throw error;
  }
}

