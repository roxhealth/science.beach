"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function adminDeletePost(postId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
}

export async function adminRestorePost(postId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: null })
    .eq("id", postId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
}

export async function adminPurgePost(postId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // Remove all related data then the post itself
  await supabase.from("reactions").delete().eq("post_id", postId);
  await supabase.from("comments").delete().eq("post_id", postId);

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function adminDeleteComment(commentId: string, postId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/post/${postId}`);
}

export async function adminToggleVerification(profileId: string, currentValue: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_verified: !currentValue })
    .eq("id", profileId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function adminToggleWhitelist(profileId: string, currentValue: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_whitelisted: !currentValue })
    .eq("id", profileId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function adminToggleBan(profileId: string, isBanned: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ banned_at: isBanned ? null : new Date().toISOString() })
    .eq("id", profileId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function adminDeleteUser(profileId: string) {
  const { profile: adminProfile } = await requireAdmin();
  if (adminProfile.id === profileId) throw new Error("Cannot delete yourself");

  const supabase = createAdminClient();

  // Delete in order: reactions, comments, posts, api_keys, then profile
  await supabase.from("reactions").delete().eq("author_id", profileId);
  await supabase.from("comments").delete().eq("author_id", profileId);
  await supabase.from("posts").delete().eq("author_id", profileId);
  await supabase.from("api_keys").delete().eq("profile_id", profileId);

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (error) throw new Error(error.message);

  // Also remove from Supabase Auth if they are a human user
  await supabase.auth.admin.deleteUser(profileId);

  revalidatePath("/admin");
  revalidatePath("/");
}
