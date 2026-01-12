"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostPreview from "@/components/PostPreview";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedDate: string;
  published: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        setAuthenticated(true);
        fetchPosts();
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    const postTitle = post?.title || "this post";
    
    if (!confirm(`Are you sure you want to delete "${postTitle}"?\n\nThis will permanently remove it from both the Blogger CMS and the main website.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (response.ok) {
        // Show success message
        alert(`Post "${postTitle}" has been deleted successfully.\n\nIt will no longer appear on the main website.`);
        // Refresh the posts list
        fetchPosts();
      } else {
        const error = await response.json();
        alert(`Error deleting post: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3001";
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const apiBaseUrl = getBaseUrl();
  const apiFeedUrl = `${apiBaseUrl}/api/feed`;
  const envExample = `BLOGGER_API_URL=${apiFeedUrl}`;
  const fetchExample = `fetch('${apiFeedUrl}')
  .then(response => response.json())
  .then(data => console.log(data));`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Blogger CMS</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowApiDetails(!showApiDetails)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {showApiDetails ? "Hide" : "Show"} API Details
              </button>
              <Link
                href="/dashboard/new"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                New Post
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showApiDetails && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">API Connection Details</h2>
              <button
                onClick={() => setShowApiDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Use these details to connect your CMS with other websites. Copy the information you need below.
            </p>

            <div className="space-y-4">
              {/* API Base URL */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Base URL:</label>
                  <button
                    onClick={() => copyToClipboard(apiBaseUrl, "baseUrl")}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {copied === "baseUrl" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <code className="text-sm text-gray-800 break-all">{apiBaseUrl}</code>
              </div>

              {/* API Feed Endpoint */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">API Feed Endpoint (Public):</label>
                  <button
                    onClick={() => copyToClipboard(apiFeedUrl, "feedUrl")}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {copied === "feedUrl" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <code className="text-sm text-gray-800 break-all">{apiFeedUrl}</code>
                <p className="text-xs text-gray-500 mt-2">
                  This endpoint returns all published blog posts. No authentication required.
                </p>
              </div>

              {/* Environment Variable Example */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Environment Variable:</label>
                  <button
                    onClick={() => copyToClipboard(envExample, "envVar")}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {copied === "envVar" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <code className="text-sm text-gray-800 break-all">{envExample}</code>
                <p className="text-xs text-gray-500 mt-2">
                  Add this to your .env file in the website you want to connect.
                </p>
              </div>

              {/* JavaScript Fetch Example */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">JavaScript Fetch Example:</label>
                  <button
                    onClick={() => copyToClipboard(fetchExample, "fetchExample")}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {copied === "fetchExample" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <pre className="text-xs text-gray-800 bg-white p-3 rounded border overflow-x-auto">
                  <code>{fetchExample}</code>
                </pre>
              </div>

              {/* API Response Format */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Response Format:</h3>
                <p className="text-xs text-gray-600 mb-2">
                  The API returns an array of published blog posts with the following structure:
                </p>
                <pre className="text-xs text-gray-800 bg-white p-3 rounded border overflow-x-auto">
                  <code>{`[
  {
    "id": "post-id",
    "title": "Post Title",
    "slug": "post-slug",
    "excerpt": "Post excerpt...",
    "content": "Full markdown content...",
    "publishedDate": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "coverImage": { "url": "image-url" } // optional
  }
]`}</code>
                </pre>
              </div>

              {/* Additional Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">📝 Notes:</h3>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>The API endpoint is public and doesn't require authentication</li>
                  <li>Only published posts are returned</li>
                  <li>Posts are sorted by published date (newest first)</li>
                  <li>For production, update the URL to your deployed CMS domain</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Blog Posts</h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No blog posts yet.</p>
            <Link
              href="/dashboard/new"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-gray-500">
                      Published: {new Date(post.publishedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPreviewPostId(post.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      title="Preview how this post will look when published"
                    >
                      View
                    </button>
                    <Link
                      href={`/dashboard/edit/${post.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      title="Delete this post (will also remove it from the main website)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewPostId && (
          <PostPreview
            postId={previewPostId}
            onClose={() => setPreviewPostId(null)}
          />
        )}
      </main>
    </div>
  );
}

