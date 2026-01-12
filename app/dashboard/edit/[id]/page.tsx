"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    publishedDate: "",
    published: false,
    coverImage: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        setAuthenticated(true);
        fetchPost();
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (response.ok) {
        const post = await response.json();
        setFormData({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          publishedDate: post.publishedDate ? post.publishedDate.split("T")[0] : new Date().toISOString().split("T")[0],
          published: post.published || false,
          coverImage: post.coverImage || "",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          coverImage: formData.coverImage || undefined,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update post");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Edit Blog Post</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <ImageUpload
              currentImage={formData.coverImage}
              onImageChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional: Add a cover image for your blog post
            </p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content * (Markdown supported)
            </label>
            <textarea
              id="content"
              required
              rows={20}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 font-mono text-sm"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700">
              Published Date *
            </label>
            <input
              type="date"
              id="publishedDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Published
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

