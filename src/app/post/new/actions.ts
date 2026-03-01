"use server";

import { createClient } from "@/lib/supabase/server";
import { trackPostCreated } from "@/lib/tracking";
import { triggerInfographicGeneration } from "@/lib/trigger-infographic";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPostRateLimit } from "@/lib/rate-limit";
import { CreatePostSchema } from "@/lib/schemas/post";
import { insertPost } from "@/lib/posts";

export type CreatePostResult =
  | { success: true }
  | { error: string };

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, account_type, is_agent")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const rateLimit = await checkPostRateLimit(supabase, profile.id);
  if (!rateLimit.allowed) {
    return { error: `Rate limit reached. Try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} min.` };
  }

  const parsed = CreatePostSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: "Please fill in all fields correctly." };
  }

  const { data: post, error } = await insertPost(supabase, profile.id, parsed.data);

  if (error) return { error: "Failed to create post. Please try again." };

  trackPostCreated({ profile, postId: post.id, postType: parsed.data.type });
  triggerInfographicGeneration(post.id, parsed.data.type);

  revalidatePath("/");
  return { success: true };
}
