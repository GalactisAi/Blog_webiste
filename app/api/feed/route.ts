import { NextResponse } from "next/server";
import { getPosts } from "@/lib/db";

// Public API endpoint to fetch published blog posts
// This is the endpoint the main website will consume
export async function GET() {
  try {
    const posts = getPosts();
    
    // Debug logging
    console.log(`[API Feed] Total posts: ${posts.length}`);
    console.log(`[API Feed] Published posts: ${posts.filter(p => p.published).length}`);

    // Return only published posts in a format compatible with the main website
    const publishedPosts = posts
      .filter((p) => p.published)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || "",
        content: p.content || "",
        publishedDate: p.publishedDate || p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
        coverImage: p.coverImage ? { url: p.coverImage } : undefined,
      }))
      .sort((a, b) => {
        try {
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        } catch (e) {
          return 0;
        }
      });
    
    console.log(`[API Feed] Returning ${publishedPosts.length} published posts`);

    return NextResponse.json(publishedPosts, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("Error in /api/feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

