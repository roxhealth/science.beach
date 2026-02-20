import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/api/auth";
import { trackPostCreated } from "@/lib/tracking";
import { triggerInfographicGeneration } from "@/lib/trigger-infographic";
import { checkPostRateLimit } from "@/lib/rate-limit";
import { CreatePostSchema } from "@/lib/schemas/post";
import { insertPost } from "@/lib/posts";

export async function POST(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }
  const parsed = CreatePostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const rateLimit = await checkPostRateLimit(auth.supabase, auth.profile.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retry_after_seconds: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { data: post, error } = await insertPost(auth.supabase, auth.profile.id, parsed.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  trackPostCreated({ profile: auth.profile, postId: post.id, postType: parsed.data.type });
  triggerInfographicGeneration(post.id, parsed.data.type);

  return NextResponse.json(post, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "20") || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0") || 0, 0);

  const { data, error } = await auth.supabase
    .from("feed_view")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
