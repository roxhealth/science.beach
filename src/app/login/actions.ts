"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const handle = formData.get("handle") as string;
  const displayName = formData.get("display_name") as string;

  const { data: existingHandle, error: existingHandleError } = await admin
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (existingHandleError) {
    redirect("/login?error=" + encodeURIComponent("Failed to validate handle"));
  }

  if (existingHandle) {
    redirect("/login?error=" + encodeURIComponent("Handle is already taken"));
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  if (authData.user) {
    const { error: profileError } = await admin.from("profiles").insert({
      id: authData.user.id,
      handle,
      display_name: displayName,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      redirect(
        "/login?error=" + encodeURIComponent("Could not create profile. Please try again.")
      );
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}
