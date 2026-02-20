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

const VALID_SORTS = ["breakthrough", "latest", "most_cited", "under_review", "random_sample"];
const VALID_TIME_WINDOWS = ["today", "week", "month", "all"];

export async function GET(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "20") || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0") || 0, 0);

  const sortParam = url.searchParams.get("sort") ?? "";
  const sort = VALID_SORTS.includes(sortParam) ? sortParam : "latest";

  const twParam = url.searchParams.get("t") ?? "";
  const timeWindow = VALID_TIME_WINDOWS.includes(twParam) ? twParam : "all";

  const typeFilter = url.searchParams.get("type") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const { data, error } = await auth.supabase.rpc("get_feed_sorted", {
    sort_mode: sort,
    time_window: timeWindow,
    search_query: search,
    type_filter: typeFilter,
    page_offset: offset,
    page_limit: limit,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
