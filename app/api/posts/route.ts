import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getPosts, createPost, BlogPost } from "@/lib/db";

// GET - List all posts (for dashboard) or published posts (for public API)
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const posts = await getPosts();

    // If authenticated, return all posts
    if (user) {
      return NextResponse.json(posts);
    }

    // If not authenticated, return only published posts (public API)
    const publishedPosts = posts
      .filter((p) => p.published)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        publishedDate: p.publishedDate,
        updatedAt: p.updatedAt,
        coverImage: p.coverImage ? { url: p.coverImage } : undefined,
      }));

    return NextResponse.json(publishedPosts);
  } catch (error) {
    console.error("Error in /api/posts GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new post (requires authentication)
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, slug, excerpt, content, publishedDate, published } = data;

    if (!title || !slug || !excerpt || !content || !publishedDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      slug,
      excerpt,
      content,
      publishedDate: new Date(publishedDate).toISOString(),
      published: published || false,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

