"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}

export default function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      onImageChange(data.url);
      setShowModal(false);
      setImageUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      alert("Please enter an image URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onImageChange(imageUrl);
      setShowModal(false);
      setImageUrl("");
    } catch {
      alert("Please enter a valid URL");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        {currentImage && (
          <div className="relative">
            <img
              src={currentImage}
              alt="Cover"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => onImageChange("")}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentImage ? "Change Image" : "Add Cover Image"}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Cover Image</h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setImageUrl("");
                  setUploadMethod("file");
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={`px-4 py-2 font-medium ${
                    uploadMethod === "file"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`px-4 py-2 font-medium ${
                    uploadMethod === "url"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {uploadMethod === "file" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
                {uploading && (
                  <p className="mt-2 text-sm text-blue-600">Uploading...</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the full URL of the image
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setImageUrl("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUrlSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Use URL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

