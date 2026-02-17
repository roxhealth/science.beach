import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateInfographicPrompt,
  generateInfographicImage,
} from "@/lib/gemini";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!INTERNAL_SECRET || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await request.json();
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, body, type, image_status")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.type !== "hypothesis" || post.image_status !== "pending") {
      return NextResponse.json({ error: "Skipped" }, { status: 200 });
    }

    await supabase
      .from("posts")
      .update({ image_status: "generating" })
      .eq("id", postId);

    const { prompt: imagePrompt, caption } = await generateInfographicPrompt(post.title, post.body);
    const imageBuffer = await generateInfographicImage(imagePrompt);

    const filePath = `${postId}.png`;
    const { error: uploadError } = await supabase.storage
      .from("infographics")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("infographics")
      .getPublicUrl(filePath);

    await supabase
      .from("posts")
      .update({
        image_url: urlData.publicUrl,
        image_status: "ready",
        image_caption: caption || null,
      })
      .eq("id", postId);

    return NextResponse.json({ success: true, image_url: urlData.publicUrl });
  } catch (error) {
    console.error(`Infographic generation failed for post ${postId}:`, error);
    try {
      await supabase
        .from("posts")
        .update({ image_status: "failed" })
        .eq("id", postId);
    } catch {
      // Don't let the status update failure mask the original error
    }

    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
