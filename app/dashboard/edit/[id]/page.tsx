"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import ContentImageInsert from "@/components/ContentImageInsert";

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
    publishedTime: "00:00",
    published: false,
    coverImage: "",
    schedulePublish: false,
  });
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

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
        const publishDate = post.publishedDate ? new Date(post.publishedDate) : new Date();
        const isScheduled = !post.published && publishDate > new Date();
        
        setFormData({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          publishedDate: publishDate.toISOString().split("T")[0],
          publishedTime: publishDate.toTimeString().slice(0, 5),
          published: post.published || false,
          coverImage: post.coverImage || "",
          schedulePublish: isScheduled,
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
      // Combine date and time for scheduled publishing
      let finalPublishedDate = formData.publishedDate;
      if (formData.schedulePublish && formData.publishedTime) {
        const [hours, minutes] = formData.publishedTime.split(":");
        const dateTime = new Date(`${formData.publishedDate}T${hours}:${minutes}:00`);
        finalPublishedDate = dateTime.toISOString();
      } else {
        finalPublishedDate = new Date(formData.publishedDate).toISOString();
      }

      // If scheduling, force published to false
      const shouldPublish = formData.schedulePublish ? false : formData.published;

      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          publishedDate: finalPublishedDate,
          published: shouldPublish,
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
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content * (Markdown supported)
              </label>
              <ContentImageInsert
                onInsert={(markdown) => {
                  const textarea = contentTextareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = formData.content;
                    const before = text.substring(0, start);
                    const after = text.substring(end);
                    const newContent = before + markdown + "\n\n" + after;
                    setFormData({ ...formData, content: newContent });
                    // Set cursor position after inserted markdown
                    setTimeout(() => {
                      textarea.focus();
                      const newPosition = start + markdown.length + 2;
                      textarea.setSelectionRange(newPosition, newPosition);
                    }, 0);
                  } else {
                    setFormData({ ...formData, content: formData.content + "\n\n" + markdown });
                  }
                }}
              />
            </div>
            <textarea
              ref={contentTextareaRef}
              id="content"
              required
              rows={20}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 font-mono text-sm"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Use the "Insert Image" button to add images to your content, or write Markdown: ![alt text](image-url)
            </p>
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

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="schedulePublish"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={formData.schedulePublish}
                onChange={(e) => setFormData({ ...formData, schedulePublish: e.target.checked, published: !e.target.checked })}
              />
              <label htmlFor="schedulePublish" className="ml-2 block text-sm text-gray-900">
                Schedule Publishing
              </label>
            </div>
            {formData.schedulePublish && (
              <div className="flex-1">
                <label htmlFor="publishedTime" className="block text-sm font-medium text-gray-700">
                  Publish Time
                </label>
                <input
                  type="time"
                  id="publishedTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.publishedTime}
                  onChange={(e) => setFormData({ ...formData, publishedTime: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Post will be automatically published at this date and time
                </p>
              </div>
            )}
          </div>

          {!formData.schedulePublish && (
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
          )}

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

