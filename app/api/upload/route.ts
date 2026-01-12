import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { supabase, isDatabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  // Check authentication
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // If Supabase is configured, upload to Supabase Storage
    if (isDatabaseConfigured() && supabase) {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = `blog-images/${filename}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("blog-images")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          throw error;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("blog-images").getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });
      } catch (error) {
        console.error("Error uploading to Supabase:", error);
        // Fall through to base64 encoding as fallback
      }
    }

    // Fallback: Convert to base64 data URL (for when Supabase not configured)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

