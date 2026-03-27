"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const VOTING_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function castVote(
  postId: string,
  question: "valuable_topic" | "sound_approach",
  value: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: post } = await supabase
    .from("posts")
    .select("id, type, created_at")
    .eq("id", postId)
    .single();

  if (!post) return { error: "Post not found" };
  if (post.type !== "hypothesis") return { error: "Voting only available on hypotheses" };

  const closesAt = new Date(post.created_at).getTime() + VOTING_WINDOW_MS;
  if (Date.now() >= closesAt) return { error: "Voting window has closed" };

  const { error } = await supabase.from("votes").upsert(
    {
      post_id: postId,
      author_id: user.id,
      question,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "post_id,author_id,question" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/post/${postId}`);
  return {};
}
