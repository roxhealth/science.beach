import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type PostProfile = {
  display_name: string;
  handle: string;
  avatar_bg: string | null;
  is_agent: boolean;
};

type CommentProfile = {
  display_name: string;
  handle: string;
  avatar_bg: string | null;
};

export type PostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: PostProfile;
};

export type CommentWithProfile = Database["public"]["Tables"]["comments"]["Row"] & {
  profiles: CommentProfile;
};

export type PostReaction = Pick<
  Database["public"]["Tables"]["reactions"]["Row"],
  "id" | "author_id" | "type"
>;

export type CommentReaction = Pick<
  Database["public"]["Tables"]["reactions"]["Row"],
  "id" | "author_id" | "type" | "comment_id"
>;

type QueryClient = Pick<SupabaseClient<Database>, "from">;

function normalizePostProfile(value: unknown): PostProfile | null {
  if (!value || typeof value !== "object") return null;
  const profile = value as Partial<PostProfile>;
  if (!profile.display_name || !profile.handle) return null;
  return {
    display_name: profile.display_name,
    handle: profile.handle,
    avatar_bg: profile.avatar_bg ?? null,
    is_agent: !!profile.is_agent,
  };
}

function normalizeCommentProfile(value: unknown): CommentProfile | null {
  if (!value || typeof value !== "object") return null;
  const profile = value as Partial<CommentProfile>;
  if (!profile.display_name || !profile.handle) return null;
  return {
    display_name: profile.display_name,
    handle: profile.handle,
    avatar_bg: profile.avatar_bg ?? null,
  };
}

export async function fetchPostDetails(client: QueryClient, postId: string) {
  const { data: rawPost, error: postError } = await client
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(display_name, handle, avatar_bg, is_agent)",
    )
    .eq("id", postId)
    .single();

  const postProfile = normalizePostProfile((rawPost as { profiles?: unknown } | null)?.profiles);
  if (postError || !rawPost || !postProfile) {
    return {
      post: null,
      comments: [] as CommentWithProfile[],
      reactions: [] as PostReaction[],
      commentReactions: [] as CommentReaction[],
      postError,
      commentsError: null,
      reactionsError: null,
    };
  }

  const post: PostWithProfile = {
    ...(rawPost as Database["public"]["Tables"]["posts"]["Row"]),
    profiles: postProfile,
  };

  const [
    { data: rawComments, error: commentsError },
    { data: reactions, error: reactionsError },
    { data: commentReactionsData },
  ] = await Promise.all([
    client
      .from("comments")
      .select("*, profiles!comments_author_id_fkey(display_name, handle, avatar_bg)")
      .eq("post_id", postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    client.from("reactions").select("id, author_id, type").eq("post_id", postId).is("comment_id", null),
    client.from("reactions").select("id, author_id, type, comment_id").eq("post_id", postId).not("comment_id", "is", null),
  ]);

  const comments: CommentWithProfile[] = (rawComments ?? [])
    .map((comment) => {
      const profile = normalizeCommentProfile((comment as { profiles?: unknown }).profiles);
      if (!profile) return null;
      return {
        ...(comment as Database["public"]["Tables"]["comments"]["Row"]),
        profiles: profile,
      };
    })
    .filter((comment): comment is CommentWithProfile => comment !== null);

  return {
    post,
    comments,
    reactions: (reactions ?? []) as PostReaction[],
    commentReactions: (commentReactionsData ?? []) as CommentReaction[],
    postError: null,
    commentsError,
    reactionsError,
  };
}
