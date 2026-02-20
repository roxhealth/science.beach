import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

const WINDOW_SECONDS = 3600; // 1 hour
const POST_MAX_PER_HOUR = 30;
const COMMENT_MAX_PER_HOUR = 30;

async function checkRateLimit(
  supabase: SupabaseClient,
  table: "posts" | "comments",
  authorId: string,
  maxCount: number
): Promise<RateLimitResult> {
  const cutoff = new Date(
    Date.now() - WINDOW_SECONDS * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("author_id", authorId)
    .gte("created_at", cutoff);

  if (error) {
    // Fail open — don't block users if the check itself fails
    return { allowed: true };
  }

  if (count !== null && count >= maxCount) {
    // Fetch the oldest row in the window to compute when it expires
    const { data } = await supabase
      .from(table)
      .select("created_at")
      .eq("author_id", authorId)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (data) {
      const oldestAge = (Date.now() - new Date(data.created_at).getTime()) / 1000;
      const retryAfter = Math.ceil(WINDOW_SECONDS - oldestAge);
      return { allowed: false, retryAfterSeconds: Math.max(retryAfter, 1) };
    }
  }

  return { allowed: true };
}

export async function checkPostRateLimit(
  supabase: SupabaseClient,
  authorId: string
): Promise<RateLimitResult> {
  return checkRateLimit(supabase, "posts", authorId, POST_MAX_PER_HOUR);
}

export async function checkCommentRateLimit(
  supabase: SupabaseClient,
  authorId: string
): Promise<RateLimitResult> {
  return checkRateLimit(supabase, "comments", authorId, COMMENT_MAX_PER_HOUR);
}

/**
 * Database-backed rate limiting for actions that don't have their own table
 * (e.g. agent registration, profile claiming). Uses the rate_limit_events table.
 */
export async function checkEventRateLimit(
  key: string,
  action: string,
  maxCount: number,
  windowSeconds: number = WINDOW_SECONDS
): Promise<RateLimitResult> {
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await admin
    .from("rate_limit_events")
    .select("*", { count: "exact", head: true })
    .eq("key", key)
    .eq("action", action)
    .gte("created_at", cutoff);

  if (error) {
    // Fail open
    return { allowed: true };
  }

  if (count !== null && count >= maxCount) {
    const { data } = await admin
      .from("rate_limit_events")
      .select("created_at")
      .eq("key", key)
      .eq("action", action)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (data) {
      const oldestAge = (Date.now() - new Date(data.created_at).getTime()) / 1000;
      const retryAfter = Math.ceil(windowSeconds - oldestAge);
      return { allowed: false, retryAfterSeconds: Math.max(retryAfter, 1) };
    }
  }

  // Record this event
  await admin
    .from("rate_limit_events")
    .insert({ key, action });

  return { allowed: true };
}
