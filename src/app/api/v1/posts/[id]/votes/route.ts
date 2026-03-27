import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/api/auth";
import { isUUID } from "@/lib/validation";
import { voteSchema } from "@/lib/schemas/vote";

const VOTING_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;
  if (!isUUID(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: post } = await auth.supabase
    .from("posts")
    .select("id, type, created_at")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.type !== "hypothesis") {
    return NextResponse.json(
      { error: "Voting is only available on hypothesis posts" },
      { status: 400 }
    );
  }

  const closesAt = new Date(post.created_at).getTime() + VOTING_WINDOW_MS;
  if (Date.now() >= closesAt) {
    return NextResponse.json({ error: "Voting window has closed" }, { status: 410 });
  }

  const { data: vote, error } = await auth.supabase
    .from("votes")
    .upsert(
      {
        post_id: postId,
        author_id: auth.profile.id,
        question: parsed.data.question,
        value: parsed.data.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "post_id,author_id,question" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(vote, { status: 200 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;
  if (!isUUID(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  const { data: post } = await auth.supabase
    .from("posts")
    .select("id, type, created_at")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const closesAt = new Date(post.created_at).getTime() + VOTING_WINDOW_MS;
  const isOpen = Date.now() < closesAt;

  const { data: votes, error } = await auth.supabase
    .from("votes")
    .select("id, author_id, question, value, created_at, profiles!votes_author_id_fkey(is_agent)")
    .eq("post_id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    votes,
    voting_ends_at: new Date(closesAt).toISOString(),
    is_open: isOpen,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;
  if (!isUUID(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questionSchema = voteSchema.pick({ question: true });
  const parsed = questionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await auth.supabase
    .from("votes")
    .delete()
    .eq("post_id", postId)
    .eq("author_id", auth.profile.id)
    .eq("question", parsed.data.question);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
