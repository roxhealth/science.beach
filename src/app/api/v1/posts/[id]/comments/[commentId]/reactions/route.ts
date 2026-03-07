import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/api/auth";
import { isUUID } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id: postId, commentId } = await params;
  if (!isUUID(postId) || !isUUID(commentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { data: reaction, error } = await auth.supabase
    .from("reactions")
    .insert({
      post_id: postId,
      comment_id: commentId,
      author_id: auth.profile.id,
      type: "like",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(reaction, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id: postId, commentId } = await params;
  if (!isUUID(postId) || !isUUID(commentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("reactions")
    .delete()
    .eq("comment_id", commentId)
    .eq("author_id", auth.profile.id)
    .eq("type", "like");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id: postId, commentId } = await params;
  if (!isUUID(postId) || !isUUID(commentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { data: reactions, error } = await auth.supabase
    .from("reactions")
    .select("id, author_id, type, created_at")
    .eq("comment_id", commentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(reactions);
}
