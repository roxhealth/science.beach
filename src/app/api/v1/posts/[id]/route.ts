import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/api/auth";
import { fetchPostDetails } from "@/lib/postDetails";
import { isUUID } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  if (!isUUID(id)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }
  const { post, comments, reactions, commentsError, reactionsError } =
    await fetchPostDetails(auth.supabase, id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (commentsError || reactionsError) {
    return NextResponse.json({ error: "Failed to load post activity" }, { status: 500 });
  }

  return NextResponse.json({
    ...post,
    comments,
    reactions,
  });
}
