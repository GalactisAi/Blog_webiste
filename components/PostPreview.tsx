"use client";

import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  published: boolean;
  coverImage?: string;
}

interface PostPreviewProps {
  postId: string;
  onClose: () => void;
}

export default function PostPreview({ postId, onClose }: PostPreviewProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to HTML converter (basic)
  const markdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // First, handle markdown image syntax: ![alt](url) - including base64 data URLs
    // This regex handles both regular URLs and base64 data URLs
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const cleanUrl = url.trim();
      // Check if it's a base64 data URL (very long)
      if (cleanUrl.startsWith('data:image/')) {
        return `<div class="my-6 text-center"><img src="${cleanUrl}" alt="${alt || 'Image'}" class="max-w-full h-auto rounded-lg shadow-md mx-auto" style="max-height: 500px; object-fit: contain; display: block;" onerror="this.style.display='none';" /></div>`;
      }
      // Regular image URL
      return `<div class="my-6 text-center"><img src="${cleanUrl}" alt="${alt || 'Image'}" class="max-w-full h-auto rounded-lg shadow-md mx-auto" style="max-height: 500px; object-fit: contain; display: block;" onerror="this.style.display='none';" /></div>`;
    });
    
    // Handle standalone base64 data URLs that might not be in markdown format
    // Match data:image/...base64,... (can be very long, so we match until we find whitespace or end)
    html = html.replace(/(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=\s]+)/g, (match, dataUrl) => {
      // Only process if not already inside an img tag
      if (!html.includes(`src="${dataUrl}`) && !html.includes(`src='${dataUrl}`)) {
        // Clean up any whitespace in the base64 string
        const cleanDataUrl = dataUrl.replace(/\s+/g, '');
        return `<div class="my-6 text-center"><img src="${cleanDataUrl}" alt="Uploaded image" class="max-w-full h-auto rounded-lg shadow-md mx-auto" style="max-height: 500px; object-fit: contain; display: block;" onerror="this.style.display='none';" /></div>`;
      }
      return match;
    });
    
    // Handle standalone http/https image URLs (not in markdown format)
    html = html.replace(/(^|\s)(https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s\)]*)?)/gi, (match, prefix, url) => {
      // Only replace if it's not already inside an img tag or markdown
      if (!match.includes('![') && !match.includes('<img') && !html.includes(`src="${url}`)) {
        return `${prefix}<div class="my-6 text-center"><img src="${url.trim()}" alt="Image" class="max-w-full h-auto rounded-lg shadow-md mx-auto" style="max-height: 500px; object-fit: contain; display: block;" onerror="this.style.display='none';" /></div>`;
      }
      return match;
    });
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links (but not image links which are already processed)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      // Skip if this looks like it was part of an image (already processed)
      if (html.includes(`<img src="${url}"`) || url.startsWith('data:image/')) {
        return match;
      }
      return `<a href="${url}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
    
    // Line breaks - split by double newlines for paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      // Don't wrap if already an HTML tag
      if (p.startsWith('<')) {
        return p;
      }
      // Replace single newlines with <br>
      p = p.replace(/\n/g, '<br />');
      return `<p class="mb-4 leading-relaxed">${p}</p>`;
    }).join('');
    
    return html;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-lg">Loading preview...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-lg text-red-600 mb-4">Post not found</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Post Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Post Content */}
        <div className="px-6 py-8">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-6">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
            <span>
              Published: {new Date(post.publishedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                post.published
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {post.published ? "Published" : "Draft"}
            </span>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-purple-500 pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none text-gray-800"
            style={{ wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

