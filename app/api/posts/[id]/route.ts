import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getPostById, updatePost, deletePost } from "@/lib/db";
import { checkAndPublishScheduledPosts } from "@/lib/scheduler";

// GET - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check and auto-publish scheduled posts
  await checkAndPublishScheduledPosts();
  
  const { id } = await params;
  const user = getAuthUser(request);
  const post = await getPostById(id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // If not authenticated, only return published posts
  if (!user && !post.published) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PUT - Update a post (requires authentication)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const data = await request.json();
    const { title, slug, excerpt, content, publishedDate, published, coverImage } = data;

    const updated = await updatePost(id, {
      title,
      slug,
      excerpt,
      content,
      publishedDate: new Date(publishedDate).toISOString(),
      published,
      coverImage: coverImage || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE - Delete a post (requires authentication)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await deletePost(id);

  if (!success) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

